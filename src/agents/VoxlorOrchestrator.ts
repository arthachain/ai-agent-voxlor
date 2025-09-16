import { PlannerAgent } from './PlannerAgent';
import { CodeAgent } from './CodeAgent';
import { DeployAgent } from './DeployAgent';
import { OptimizerAgent } from './OptimizerAgent';
import { ResearchAgent } from './ResearchAgent';
import { getModelClient } from '../VOXLOR/src/ipc/utils/get_model_client';
import type { LargeLanguageModel, UserSettings } from '../VOXLOR/src/lib/schemas';

export interface AppGenerationRequest {
  prompt: string;
  platform: 'web' | 'mobile' | 'ar';
  features: string[];
  style: string;
  targetAudience: string;
}

export interface AppGenerationResult {
  success: boolean;
  appId: string;
  deploymentUrl?: string;
  code: any;
  research: any;
  optimization: any;
  errors: string[];
  logs: string[];
}

export class VoxlorOrchestrator {
  private plannerAgent: PlannerAgent;
  private codeAgent: CodeAgent;
  private deployAgent: DeployAgent;
  private optimizerAgent: OptimizerAgent;
  private researchAgent: ResearchAgent;
  private userSettings: UserSettings;
  private defaultModel: LargeLanguageModel;

  constructor(userSettings?: UserSettings) {
    this.plannerAgent = new PlannerAgent();
    this.codeAgent = new CodeAgent();
    this.deployAgent = new DeployAgent();
    this.optimizerAgent = new OptimizerAgent();
    this.researchAgent = new ResearchAgent();
    
    // Initialize with default settings or provided settings
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

  async generateApp(request: AppGenerationRequest): Promise<AppGenerationResult> {
    console.log('🚀 Voxlor Orchestrator: Starting app generation...');
    
    const result: AppGenerationResult = {
      success: false,
      appId: `voxlor-${Date.now()}`,
      code: null,
      research: null,
      optimization: null,
      errors: [],
      logs: []
    };

    try {
      // Step 1: Research and gather insights
      console.log('🔍 Step 1: Researching app requirements...');
      const research = await this.researchAgent.researchApp(request.prompt);
      result.research = research;
      result.logs.push('✅ Research completed');

      // Step 2: Plan the app structure
      console.log('📋 Step 2: Planning app structure...');
      const plan = await this.plannerAgent.planApp(request, research);
      result.logs.push('✅ App structure planned');

      // Step 3: Generate code
      console.log('💻 Step 3: Generating code...');
      const code = await this.codeAgent.generateCode(plan, request);
      result.code = code;
      result.logs.push('✅ Code generated');

      // Step 4: Optimize code
      console.log('🔧 Step 4: Optimizing code...');
      const optimization = await this.optimizerAgent.optimizeCode(code);
      result.optimization = optimization;
      result.logs.push('✅ Code optimized');

      // Step 5: Deploy app
      console.log('🚀 Step 5: Deploying app...');
      const deployment = await this.deployAgent.deployApp(optimization.optimizedCode, {
        platform: 'vercel',
        environment: 'production'
      });
      
      if (deployment.success && deployment.url) {
        result.deploymentUrl = deployment.url;
        result.logs.push('✅ App deployed successfully');
      } else {
        result.errors.push('Deployment failed');
        result.logs.push('❌ Deployment failed');
      }

      result.success = true;
      console.log('🎉 Voxlor Orchestrator: App generation completed successfully!');
      
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.logs.push(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('❌ Voxlor Orchestrator: App generation failed:', error);
    }

    return result;
  }

  async generateAppFromPrompt(prompt: string): Promise<AppGenerationResult> {
    // Extract information from prompt using AI
    const request: AppGenerationRequest = {
      prompt,
      platform: 'web', // Default to web
      features: [],
      style: 'modern',
      targetAudience: 'general'
    };

    return this.generateApp(request);
  }
}