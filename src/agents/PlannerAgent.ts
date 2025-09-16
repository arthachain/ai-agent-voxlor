import { getModelClient } from '../VOXLOR/src/ipc/utils/get_model_client';
import type { LargeLanguageModel, UserSettings } from '../VOXLOR/src/lib/schemas';

export interface AppPlan {
  name: string;
  description: string;
  features: string[];
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
  structure: {
    pages: string[];
    components: string[];
    api: string[];
  };
  timeline: string;
  complexity: 'simple' | 'medium' | 'complex';
}

export class PlannerAgent {
  private userSettings: UserSettings;
  private defaultModel: LargeLanguageModel;

  constructor(userSettings?: UserSettings) {
    this.userSettings = userSettings || this.getDefaultSettings();
    this.defaultModel = {
      provider: 'auto',
      name: 'auto'
    };
  }

  private getDefaultSettings(): UserSettings {
    return {
      enableDyadPro: false,
      enableProSmartFilesContextMode: false,
      enableProLazyEditsMode: false,
      selectedChatMode: 'ask',
      proSmartContextOption: 'balanced',
      providerSettings: {
        auto: {
          apiKey: { value: '', isVisible: false }
        }
      }
    };
  }

  async planApp(request: any, research?: any): Promise<AppPlan> {
    console.log('🎯 Planner Agent: Starting app planning...');
    
    try {
      // Get model client from VOXLOR
      const { modelClient } = await getModelClient(this.defaultModel, this.userSettings);
      
      // Step 1: Fast initial analysis
      const analysisPrompt = this.createAnalysisPrompt(request.prompt);
      const analysisResponse = await modelClient.model.generateText({
        prompt: analysisPrompt,
        maxTokens: 1000,
        temperature: 0.3
      });

      // Step 2: Detailed planning with research context
      const planningPrompt = this.createPlanningPrompt(request.prompt, analysisResponse.text, research);
      const planResponse = await modelClient.model.generateText({
        prompt: planningPrompt,
        maxTokens: 2000,
        temperature: 0.5
      });

      // Step 3: Parse and structure the plan
      const plan = this.parsePlan(planResponse.text, request.prompt);
      
      console.log('✅ Planner Agent: App plan completed');
      return plan;
    } catch (error) {
      console.error('❌ Planner Agent: Planning failed:', error);
      return this.createFallbackPlan(request.prompt);
    }
  }

  private createAnalysisPrompt(prompt: string): string {
    return `
Analyze this app request and provide a quick assessment:

User Request: "${prompt}"

Please analyze:
1. What type of app is being requested?
2. What are the main features needed?
3. What's the complexity level (simple/medium/complex)?
4. What platforms should it support (web/mobile/AR)?

Respond in JSON format:
{
  "appType": "string",
  "mainFeatures": ["feature1", "feature2"],
  "complexity": "simple|medium|complex",
  "platforms": ["web", "mobile", "AR"]
}
    `.trim();
  }

  private createPlanningPrompt(prompt: string, analysis: string, research?: any): string {
    return `
Create a detailed app development plan based on this analysis:

User Request: "${prompt}"
Initial Analysis: ${analysis}
${research ? `Research Context: ${JSON.stringify(research, null, 2)}` : ''}

Please create a comprehensive plan including:

1. App Name and Description
2. Feature List (prioritized)
3. Technology Stack:
   - Frontend: React/Vue/Angular + specific libraries
   - Backend: Node.js/Python/Go + frameworks
   - Database: PostgreSQL/MongoDB/Redis
   - Deployment: Vercel/Netlify/AWS
4. App Structure:
   - Pages/Screens needed
   - Components to build
   - API endpoints required
5. Development Timeline
6. Complexity Assessment

Respond in this JSON format:
{
  "name": "App Name",
  "description": "Brief description",
  "features": ["feature1", "feature2", "feature3"],
  "techStack": {
    "frontend": "React + Tailwind CSS + TypeScript",
    "backend": "Node.js + Express + TypeScript",
    "database": "PostgreSQL + Prisma ORM",
    "deployment": "Vercel + Railway"
  },
  "structure": {
    "pages": ["Home", "Dashboard", "Profile"],
    "components": ["Header", "Sidebar", "Card", "Modal"],
    "api": ["/api/auth", "/api/users", "/api/data"]
  },
  "timeline": "2-3 days for MVP",
  "complexity": "medium"
}
    `.trim();
  }

  private parsePlan(planContent: string, originalPrompt: string): AppPlan {
    try {
      // Extract JSON from the response
      const jsonMatch = planContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in plan response');
      }

      const planData = JSON.parse(jsonMatch[0]);
      
      return {
        name: planData.name || this.generateAppName(originalPrompt),
        description: planData.description || 'AI-generated app',
        features: planData.features || [],
        techStack: {
          frontend: planData.techStack?.frontend || 'React + TypeScript',
          backend: planData.techStack?.backend || 'Node.js + Express',
          database: planData.techStack?.database || 'PostgreSQL',
          deployment: planData.techStack?.deployment || 'Vercel'
        },
        structure: {
          pages: planData.structure?.pages || ['Home'],
          components: planData.structure?.components || ['App'],
          api: planData.structure?.api || []
        },
        timeline: planData.timeline || '1-2 days',
        complexity: planData.complexity || 'simple'
      };
    } catch (error) {
      console.error('Error parsing plan:', error);
      
      // Fallback plan
      return {
        name: this.generateAppName(originalPrompt),
        description: 'AI-generated app based on your request',
        features: ['User interface', 'Data management', 'Responsive design'],
        techStack: {
          frontend: 'React + TypeScript + Tailwind CSS',
          backend: 'Node.js + Express',
          database: 'PostgreSQL',
          deployment: 'Vercel'
        },
        structure: {
          pages: ['Home', 'Dashboard'],
          components: ['Header', 'Main', 'Footer'],
          api: ['/api/data']
        },
        timeline: '1-2 days',
        complexity: 'simple'
      };
    }
  }

  private generateAppName(prompt: string): string {
    // Simple name generation based on prompt keywords
    const keywords = prompt.toLowerCase()
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 2);
    
    return keywords.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') + ' App';
  }

  private createFallbackPlan(prompt: string): AppPlan {
    return {
      name: this.generateAppName(prompt),
      description: 'AI-generated app based on your request',
      features: ['User interface', 'Data management', 'Responsive design'],
      techStack: {
        frontend: 'React + TypeScript + Tailwind CSS',
        backend: 'Node.js + Express',
        database: 'PostgreSQL',
        deployment: 'Vercel'
      },
      structure: {
        pages: ['Home', 'Dashboard'],
        components: ['Header', 'Main', 'Footer'],
        api: ['/api/data']
      },
      timeline: '1-2 days',
      complexity: 'simple'
    };
  }

  async refinePlan(plan: AppPlan, feedback: string): Promise<AppPlan> {
    console.log('🔄 Planner Agent: Refining plan based on feedback...');
    
    try {
      const { modelClient } = await getModelClient(this.defaultModel, this.userSettings);
      
      const refinementPrompt = `
Refine this app plan based on the feedback:

Current Plan: ${JSON.stringify(plan, null, 2)}
Feedback: "${feedback}"

Please provide an updated plan that addresses the feedback.
Respond in the same JSON format as before.
      `.trim();

      const refinedResponse = await modelClient.model.generateText({
        prompt: refinementPrompt,
        maxTokens: 2000,
        temperature: 0.5
      });
      
      const refinedPlan = this.parsePlan(refinedResponse.text, plan.name);
      
      console.log('✅ Planner Agent: Plan refined');
      return refinedPlan;
    } catch (error) {
      console.error('❌ Planner Agent: Plan refinement failed:', error);
      return plan; // Return original plan if refinement fails
    }
  }
}
