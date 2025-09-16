import { BaseLLM, CodeLlamaLLM, LLMFactory } from '../llm/LLMInterface';
import { AppPlan } from './PlannerAgent';

export interface GeneratedCode {
  frontend: {
    components: { [key: string]: string };
    pages: { [key: string]: string };
    styles: { [key: string]: string };
    config: { [key: string]: any };
  };
  backend: {
    routes: { [key: string]: string };
    models: { [key: string]: string };
    middleware: { [key: string]: string };
    config: { [key: string]: any };
  };
  database: {
    schema: string;
    migrations: string[];
    seeds: string[];
  };
  deployment: {
    dockerfile: string;
    dockerCompose: string;
    vercelConfig: any;
  };
}

export class CodeAgent {
  private codeLlamaLLM: CodeLlamaLLM;

  constructor() {
    this.codeLlamaLLM = LLMFactory.createCodeLlama();
  }

  async generateCode(plan: AppPlan): Promise<GeneratedCode> {
    console.log('💻 Code Agent: Starting code generation...');
    
    const generatedCode: GeneratedCode = {
      frontend: { components: {}, pages: {}, styles: {}, config: {} },
      backend: { routes: {}, models: {}, middleware: {}, config: {} },
      database: { schema: '', migrations: [], seeds: [] },
      deployment: { dockerfile: '', dockerCompose: '', vercelConfig: {} }
    };

    // Generate frontend code
    generatedCode.frontend = await this.generateFrontendCode(plan);
    
    // Generate backend code
    generatedCode.backend = await this.generateBackendCode(plan);
    
    // Generate database schema
    generatedCode.database = await this.generateDatabaseCode(plan);
    
    // Generate deployment configs
    generatedCode.deployment = await this.generateDeploymentCode(plan);

    console.log('✅ Code Agent: Code generation completed');
    return generatedCode;
  }

  private async generateFrontendCode(plan: AppPlan): Promise<GeneratedCode['frontend']> {
    const frontendPrompt = `
Generate React + TypeScript frontend code for this app:

App Plan: ${JSON.stringify(plan, null, 2)}

Please generate:
1. Main App component
2. All required pages
3. All required components
4. Tailwind CSS styles
5. TypeScript interfaces
6. Package.json dependencies

For each file, provide the complete code with proper imports and exports.
Use modern React patterns (hooks, functional components).
Use TypeScript for type safety.
Use Tailwind CSS for styling.

Respond in this JSON format:
{
  "components": {
    "Header.tsx": "// complete component code",
    "Sidebar.tsx": "// complete component code"
  },
  "pages": {
    "Home.tsx": "// complete page code",
    "Dashboard.tsx": "// complete page code"
  },
  "styles": {
    "globals.css": "// global styles",
    "components.css": "// component styles"
  },
  "config": {
    "package.json": "// frontend dependencies",
    "tsconfig.json": "// TypeScript config"
  }
}
    `.trim();

    const response = await this.codeLlamaLLM.generate(frontendPrompt);
    return this.parseCodeResponse(response.content, 'frontend');
  }

  private async generateBackendCode(plan: AppPlan): Promise<GeneratedCode['backend']> {
    const backendPrompt = `
Generate Node.js + Express backend code for this app:

App Plan: ${JSON.stringify(plan, null, 2)}

Please generate:
1. Express server setup
2. API routes for all endpoints
3. Database models/schemas
4. Middleware functions
5. Authentication logic
6. Error handling

Use TypeScript, Express, and Prisma ORM.
Include proper error handling and validation.
Use modern async/await patterns.

Respond in this JSON format:
{
  "routes": {
    "auth.ts": "// authentication routes",
    "users.ts": "// user management routes",
    "data.ts": "// data API routes"
  },
  "models": {
    "User.ts": "// Prisma model",
    "Data.ts": "// data model"
  },
  "middleware": {
    "auth.ts": "// authentication middleware",
    "validation.ts": "// input validation"
  },
  "config": {
    "package.json": "// backend dependencies",
    "prisma.schema": "// database schema"
  }
}
    `.trim();

    const response = await this.codeLlamaLLM.generate(backendPrompt);
    return this.parseCodeResponse(response.content, 'backend');
  }

  private async generateDatabaseCode(plan: AppPlan): Promise<GeneratedCode['database']> {
    const databasePrompt = `
Generate database schema and migrations for this app:

App Plan: ${JSON.stringify(plan, null, 2)}

Please generate:
1. Prisma schema with all required models
2. Database migrations
3. Seed data for testing
4. Indexes for performance

Use PostgreSQL as the database.
Include proper relationships and constraints.

Respond in this JSON format:
{
  "schema": "// complete Prisma schema",
  "migrations": [
    "// migration 1",
    "// migration 2"
  ],
  "seeds": [
    "// seed data 1",
    "// seed data 2"
  ]
}
    `.trim();

    const response = await this.codeLlamaLLM.generate(databasePrompt);
    return this.parseCodeResponse(response.content, 'database');
  }

  private async generateDeploymentCode(plan: AppPlan): Promise<GeneratedCode['deployment']> {
    const deploymentPrompt = `
Generate deployment configuration for this app:

App Plan: ${JSON.stringify(plan, null, 2)}

Please generate:
1. Dockerfile for containerization
2. Docker Compose for local development
3. Vercel configuration for deployment
4. Environment variables setup

Make it production-ready with proper optimization.

Respond in this JSON format:
{
  "dockerfile": "// complete Dockerfile",
  "dockerCompose": "// docker-compose.yml",
  "vercelConfig": {
    "vercel.json": "// Vercel configuration"
  }
}
    `.trim();

    const response = await this.codeLlamaLLM.generate(deploymentPrompt);
    return this.parseCodeResponse(response.content, 'deployment');
  }

  private parseCodeResponse(content: string, type: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(`No JSON found in ${type} response`);
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error(`Error parsing ${type} code:`, error);
      
      // Return fallback structure
      if (type === 'frontend') {
        return {
          components: { 'App.tsx': '// Generated component' },
          pages: { 'Home.tsx': '// Generated page' },
          styles: { 'globals.css': '/* Generated styles */' },
          config: { 'package.json': '{}' }
        };
      } else if (type === 'backend') {
        return {
          routes: { 'index.ts': '// Generated route' },
          models: { 'User.ts': '// Generated model' },
          middleware: { 'auth.ts': '// Generated middleware' },
          config: { 'package.json': '{}' }
        };
      } else if (type === 'database') {
        return {
          schema: '// Generated schema',
          migrations: ['// Generated migration'],
          seeds: ['// Generated seed']
        };
      } else if (type === 'deployment') {
        return {
          dockerfile: '# Generated Dockerfile',
          dockerCompose: '# Generated docker-compose.yml',
          vercelConfig: {}
        };
      }
    }
  }

  async optimizeCode(code: GeneratedCode, feedback: string): Promise<GeneratedCode> {
    console.log('🔧 Code Agent: Optimizing code based on feedback...');
    
    const optimizationPrompt = `
Optimize this generated code based on feedback:

Generated Code: ${JSON.stringify(code, null, 2)}
Feedback: "${feedback}"

Please provide optimized code that addresses the feedback.
Focus on:
- Performance improvements
- Code quality
- Security enhancements
- Best practices

Respond in the same JSON format as before.
    `.trim();

    const optimizedResponse = await this.codeLlamaLLM.generate(optimizationPrompt);
    const optimizedCode = this.parseCodeResponse(optimizedResponse.content, 'optimization');
    
    console.log('✅ Code Agent: Code optimization completed');
    return optimizedCode;
  }
}
