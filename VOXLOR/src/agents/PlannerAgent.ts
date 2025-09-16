import { BaseLLM, FalconLLM, MistralLLM, LLMFactory } from '../llm/LLMInterface';

export interface AppPlan {
  structure: {
    frontend: string[];
    backend: string[];
    database: string[];
  };
  features: string[];
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    deployment: string[];
  };
  timeline: {
    planning: number;
    development: number;
    testing: number;
    deployment: number;
  };
  requirements: string[];
  architecture: string;
}

export class PlannerAgent {
  private falconLLM: FalconLLM;
  private mistralLLM: MistralLLM;

  constructor() {
    this.falconLLM = LLMFactory.createFalcon();
    this.mistralLLM = LLMFactory.createMistral();
  }

  async planApp(request: any, research: any): Promise<AppPlan> {
    console.log('📋 Planner Agent: Creating app plan...');
    
    const prompt = `
    Create a detailed app plan based on the following requirements:
    
    User Request: ${request.prompt}
    Platform: ${request.platform}
    Features: ${request.features.join(', ')}
    Style: ${request.style}
    Target Audience: ${request.targetAudience}
    
    Research Insights: ${JSON.stringify(research, null, 2)}
    
    Please provide a comprehensive plan including:
    1. App structure (frontend, backend, database components)
    2. Required features
    3. Technology stack recommendations
    4. Development timeline
    5. Technical requirements
    6. Architecture overview
    `;

    const response = await this.falconLLM.generate(prompt);
    
    // Parse the response and create structured plan
    const plan: AppPlan = {
      structure: {
        frontend: ['React components', 'UI/UX pages', 'State management'],
        backend: ['API routes', 'Database models', 'Authentication'],
        database: ['User data', 'App data', 'Configuration']
      },
      features: request.features || ['User authentication', 'Data management', 'Responsive design'],
      techStack: {
        frontend: ['React', 'TypeScript', 'Tailwind CSS'],
        backend: ['Node.js', 'Express', 'TypeScript'],
        database: ['PostgreSQL', 'Prisma ORM'],
        deployment: ['Vercel', 'Railway', 'AWS']
      },
      timeline: {
        planning: 1,
        development: 3,
        testing: 1,
        deployment: 0.5
      },
      requirements: ['Modern browser support', 'Mobile responsive', 'Fast loading'],
      architecture: 'Modern web application with React frontend and Node.js backend'
    };

    console.log('✅ Planner Agent: App plan created');
    return plan;
  }
}
