import { VoxlorOrchestrator } from '../agents/VoxlorOrchestrator';

// Example usage of the Voxlor Multi-Agent System
export class VoxlorExample {
  private orchestrator: VoxlorOrchestrator;

  constructor(vercelToken?: string, netlifyToken?: string) {
    this.orchestrator = new VoxlorOrchestrator(vercelToken, netlifyToken);
  }

  async generateSimpleApp(): Promise<void> {
    console.log('🚀 Voxlor Example: Generating a simple task management app...');
    
    const request = VoxlorOrchestrator.createSimpleRequest(
      'Build me a task management app like Notion with drag-and-drop functionality',
      {
        includeResearch: true,
        optimizeCode: true,
        autoDeploy: false // Set to true to auto-deploy
      }
    );

    try {
      const response = await this.orchestrator.generateApp(request);
      
      if (response.success) {
        console.log('✅ App generated successfully!');
        console.log('📋 Plan:', response.plan);
        console.log('💻 Code generated for:', Object.keys(response.code?.frontend.components || {}));
        console.log('🔍 Research insights:', response.research?.overallInsights);
        console.log('🔧 Optimization score:', response.optimization?.performanceScore);
        console.log('⏱️ Total time:', response.totalTime + 'ms');
      } else {
        console.error('❌ App generation failed:', response.errors);
      }
    } catch (error) {
      console.error('❌ Error generating app:', error);
    }
  }

  async generateEcommerceApp(): Promise<void> {
    console.log('🛒 Voxlor Example: Generating an e-commerce app...');
    
    const request = VoxlorOrchestrator.createSimpleRequest(
      'Create an e-commerce website with product catalog, shopping cart, and payment integration',
      {
        includeResearch: true,
        optimizeCode: true,
        autoDeploy: true,
        platform: 'vercel'
      }
    );

    try {
      const response = await this.orchestrator.generateApp(request);
      
      if (response.success) {
        console.log('✅ E-commerce app generated successfully!');
        console.log('🌐 App URL:', response.url);
        console.log('📊 Performance Score:', response.optimization?.performanceScore);
        console.log('🔒 Security Score:', response.optimization?.securityScore);
      } else {
        console.error('❌ E-commerce app generation failed:', response.errors);
      }
    } catch (error) {
      console.error('❌ Error generating e-commerce app:', error);
    }
  }

  async generateMobileApp(): Promise<void> {
    console.log('📱 Voxlor Example: Generating a mobile fitness tracker app...');
    
    const request = VoxlorOrchestrator.createSimpleRequest(
      'Build a fitness tracker mobile app with workout logging, progress tracking, and social features',
      {
        includeResearch: true,
        optimizeCode: true,
        autoDeploy: false
      }
    );

    try {
      const response = await this.orchestrator.generateApp(request);
      
      if (response.success) {
        console.log('✅ Mobile app generated successfully!');
        console.log('📱 Mobile components:', Object.keys(response.code?.frontend.components || {}));
        console.log('🎯 App features:', response.plan?.features);
        console.log('⚡ Tech stack:', response.plan?.techStack);
      } else {
        console.error('❌ Mobile app generation failed:', response.errors);
      }
    } catch (error) {
      console.error('❌ Error generating mobile app:', error);
    }
  }

  async researchAndGenerate(): Promise<void> {
    console.log('🔍 Voxlor Example: Researching and generating a social media app...');
    
    // First, research the topic
    const research = await this.orchestrator.researchTopic('social media app best practices');
    console.log('📚 Research insights:', research.overallInsights);
    
    // Then generate the app
    const request = VoxlorOrchestrator.createSimpleRequest(
      'Build a social media app with posts, comments, likes, and user profiles',
      {
        includeResearch: false, // Already researched
        optimizeCode: true,
        autoDeploy: false
      }
    );

    try {
      const response = await this.orchestrator.generateApp(request);
      
      if (response.success) {
        console.log('✅ Social media app generated successfully!');
        console.log('👥 User features:', response.plan?.structure.pages);
        console.log('🔧 API endpoints:', response.plan?.structure.api);
      } else {
        console.error('❌ Social media app generation failed:', response.errors);
      }
    } catch (error) {
      console.error('❌ Error generating social media app:', error);
    }
  }

  async deployAndMonitor(): Promise<void> {
    console.log('🚀 Voxlor Example: Deploying and monitoring an app...');
    
    // Generate a simple app first
    const request = VoxlorOrchestrator.createSimpleRequest(
      'Create a simple blog website with posts and comments',
      {
        includeResearch: false,
        optimizeCode: true,
        autoDeploy: true,
        platform: 'vercel'
      }
    );

    try {
      const response = await this.orchestrator.generateApp(request);
      
      if (response.success && response.deployment?.deploymentId) {
        console.log('✅ App deployed successfully!');
        console.log('🌐 Deployment URL:', response.url);
        
        // Monitor deployment status
        const status = await this.orchestrator.getAppStatus(response.deployment.deploymentId);
        console.log('📊 Deployment status:', status.status);
        console.log('📝 Status logs:', status.logs);
        
        // Example: Rollback if needed (uncomment to test)
        // if (status.status === 'error') {
        //   const rollbackSuccess = await this.orchestrator.rollbackApp(response.deployment.deploymentId);
        //   console.log('🔄 Rollback result:', rollbackSuccess);
        // }
      } else {
        console.error('❌ App deployment failed:', response.errors);
      }
    } catch (error) {
      console.error('❌ Error deploying app:', error);
    }
  }

  async runAllExamples(): Promise<void> {
    console.log('🎯 Voxlor Example: Running all examples...');
    
    try {
      await this.generateSimpleApp();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.generateEcommerceApp();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.generateMobileApp();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.researchAndGenerate();
      console.log('\n' + '='.repeat(50) + '\n');
      
      await this.deployAndMonitor();
      
      console.log('\n🎉 All Voxlor examples completed successfully!');
    } catch (error) {
      console.error('❌ Error running examples:', error);
    }
  }
}

// Example usage
export async function runVoxlorExamples() {
  const example = new VoxlorExample(
    process.env.VERCEL_TOKEN,
    process.env.NETLIFY_TOKEN
  );
  
  await example.runAllExamples();
}

// Export for use in other files
export { VoxlorExample };
