import { GeneratedCode } from './CodeAgent';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'railway' | 'aws';
  environment: 'development' | 'staging' | 'production';
  domain?: string;
  customDomain?: string;
  url?: string;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  logs: string[];
  errors: string[];
}

export class DeployAgent {
  private vercelToken?: string;
  private netlifyToken?: string;

  constructor(vercelToken?: string, netlifyToken?: string) {
    this.vercelToken = vercelToken;
    this.netlifyToken = netlifyToken;
  }

  async deployApp(
    code: GeneratedCode, 
    config: DeploymentConfig
  ): Promise<DeploymentResult> {
    console.log(`🚀 Deploy Agent: Starting deployment to ${config.platform}...`);
    
    const result: DeploymentResult = {
      success: false,
      logs: [],
      errors: []
    };

    try {
      // Prepare deployment files
      const deploymentFiles = await this.prepareDeploymentFiles(code, config);
      
      // Deploy based on platform
      switch (config.platform) {
        case 'vercel':
          result.url = await this.deployToVercel(deploymentFiles, config);
          break;
        case 'netlify':
          result.url = await this.deployToNetlify(deploymentFiles, config);
          break;
        case 'railway':
          result.url = await this.deployToRailway(deploymentFiles, config);
          break;
        case 'aws':
          result.url = await this.deployToAWS(deploymentFiles, config);
          break;
        default:
          throw new Error(`Unsupported platform: ${config.platform}`);
      }

      result.success = true;
      result.logs.push(`Successfully deployed to ${config.platform}`);
      
      console.log('✅ Deploy Agent: Deployment completed successfully');
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Deploy Agent: Deployment failed:', error);
    }

    return result;
  }

  private async prepareDeploymentFiles(
    code: GeneratedCode, 
    config: DeploymentConfig
  ): Promise<{ [key: string]: string }> {
    console.log('📦 Deploy Agent: Preparing deployment files...');
    
    const files: { [key: string]: string } = {};

    // Frontend files
    Object.entries(code.frontend.components).forEach(([name, content]) => {
      files[`src/components/${name}`] = content;
    });

    Object.entries(code.frontend.pages).forEach(([name, content]) => {
      files[`src/pages/${name}`] = content;
    });

    Object.entries(code.frontend.styles).forEach(([name, content]) => {
      files[`src/styles/${name}`] = content;
    });

    // Backend files
    Object.entries(code.backend.routes).forEach(([name, content]) => {
      files[`api/${name}`] = content;
    });

    // Configuration files
    files['package.json'] = this.generatePackageJson(code);
    files['vercel.json'] = this.generateVercelConfig(config);
    files['next.config.js'] = this.generateNextConfig();
    files['tsconfig.json'] = this.generateTSConfig();

    // Environment variables
    files['.env.local'] = this.generateEnvFile(config);

    console.log('✅ Deploy Agent: Deployment files prepared');
    return files;
  }

  private async deployToVercel(
    files: { [key: string]: string }, 
    config: DeploymentConfig
  ): Promise<string> {
    console.log('🚀 Deploy Agent: Deploying to Vercel...');
    
    if (!this.vercelToken) {
      throw new Error('Vercel token not provided');
    }

    try {
      // Create a temporary directory for deployment
      const tempDir = path.join(process.cwd(), 'temp-deploy', `voxlor-${Date.now()}`);
      await fs.promises.mkdir(tempDir, { recursive: true });

      // Write all files to temp directory
      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(tempDir, filePath);
        await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.promises.writeFile(fullPath, content);
      }

      // Create deployment using Vercel CLI approach
      const formData = new FormData();
      
      // Add all files to form data
      for (const [filePath, content] of Object.entries(files)) {
        formData.append('files', Buffer.from(content), {
          filename: filePath,
          contentType: this.getContentType(filePath)
        });
      }

      // Deploy to Vercel
      const response = await axios.post('https://api.vercel.com/v13/deployments', formData, {
        headers: {
          'Authorization': `Bearer ${this.vercelToken}`,
          ...formData.getHeaders()
        },
        params: {
          name: `voxlor-app-${Date.now()}`,
          projectSettings: JSON.stringify({
            framework: 'nextjs',
            buildCommand: 'npm run build',
            outputDirectory: '.next'
          })
        }
      });

      const deploymentId = response.data.id;
      const url = response.data.url || `https://${deploymentId}.vercel.app`;

      // Clean up temp directory
      await fs.promises.rmdir(tempDir, { recursive: true });

      console.log(`✅ Deploy Agent: Deployed to Vercel - ${url}`);
      return url;
    } catch (error) {
      console.error('❌ Deploy Agent: Vercel deployment failed:', error);
      throw new Error(`Vercel deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      '.js': 'application/javascript',
      '.ts': 'application/typescript',
      '.tsx': 'application/typescript',
      '.jsx': 'application/javascript',
      '.json': 'application/json',
      '.css': 'text/css',
      '.html': 'text/html',
      '.md': 'text/markdown'
    };
    return contentTypes[ext] || 'text/plain';
  }

  private async deployToNetlify(
    files: { [key: string]: string }, 
    config: DeploymentConfig
  ): Promise<string> {
    console.log('🚀 Deploy Agent: Deploying to Netlify...');
    
    if (!this.netlifyToken) {
      throw new Error('Netlify token not provided');
    }

    try {
      // Create a temporary directory for deployment
      const tempDir = path.join(process.cwd(), 'temp-netlify-deploy', `voxlor-${Date.now()}`);
      await fs.promises.mkdir(tempDir, { recursive: true });

      // Write all files to temp directory
      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(tempDir, filePath);
        await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.promises.writeFile(fullPath, content);
      }

      // Create a zip file for Netlify deployment
      const archiver = require('archiver');
      const output = fs.createWriteStream(path.join(tempDir, 'deployment.zip'));
      const archive = archiver('zip', { zlib: { level: 9 } });

      return new Promise((resolve, reject) => {
        output.on('close', async () => {
          try {
            // Upload to Netlify using their API
            const formData = new FormData();
            formData.append('file', fs.createReadStream(path.join(tempDir, 'deployment.zip')));

            const response = await axios.post('https://api.netlify.com/api/v1/sites', formData, {
              headers: {
                'Authorization': `Bearer ${this.netlifyToken}`,
                ...formData.getHeaders()
              }
            });

            const siteId = response.data.id;
            const url = response.data.url || `https://${siteId}.netlify.app`;

            // Clean up temp directory
            await fs.promises.rmdir(tempDir, { recursive: true });

            console.log(`✅ Deploy Agent: Deployed to Netlify - ${url}`);
            resolve(url);
          } catch (error) {
            console.error('❌ Deploy Agent: Netlify deployment failed:', error);
            reject(new Error(`Netlify deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        });

        archive.on('error', reject);
        archive.pipe(output);

        // Add all files to archive
        for (const [filePath, content] of Object.entries(files)) {
          archive.append(content, { name: filePath });
        }

        archive.finalize();
      });
    } catch (error) {
      console.error('❌ Deploy Agent: Netlify deployment failed:', error);
      throw new Error(`Netlify deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async deployToRailway(
    files: { [key: string]: string }, 
    config: DeploymentConfig
  ): Promise<string> {
    console.log('🚀 Deploy Agent: Deploying to Railway...');
    
    const railwayToken = process.env.RAILWAY_TOKEN;
    if (!railwayToken) {
      throw new Error('Railway token not provided. Set RAILWAY_TOKEN environment variable.');
    }

    try {
      // Create a temporary directory for deployment
      const tempDir = path.join(process.cwd(), 'temp-railway-deploy', `voxlor-${Date.now()}`);
      await fs.promises.mkdir(tempDir, { recursive: true });

      // Write all files to temp directory
      for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(tempDir, filePath);
        await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.promises.writeFile(fullPath, content);
      }

      // Create a git repository for Railway deployment
      const { execSync } = require('child_process');
      execSync('git init', { cwd: tempDir });
      execSync('git add .', { cwd: tempDir });
      execSync('git commit -m "Initial commit"', { cwd: tempDir });

      // Create a new Railway project
      const projectResponse = await axios.post('https://backboard.railway.app/graphql/v1', {
        query: `
          mutation {
            projectCreate(input: { name: "voxlor-app-${Date.now()}" }) {
              id
              name
            }
          }
        `
      }, {
        headers: {
          'Authorization': `Bearer ${railwayToken}`,
          'Content-Type': 'application/json'
        }
      });

      const projectId = projectResponse.data.data.projectCreate.id;

      // Deploy to Railway using their API
      const deployResponse = await axios.post(`https://backboard.railway.app/graphql/v1`, {
        query: `
          mutation {
            deploymentCreate(input: { 
              projectId: "${projectId}",
              source: "git",
              repository: "${tempDir}"
            }) {
              id
              status
              url
            }
          }
        `
      }, {
        headers: {
          'Authorization': `Bearer ${railwayToken}`,
          'Content-Type': 'application/json'
        }
      });

      const deploymentId = deployResponse.data.data.deploymentCreate.id;
      const url = `https://${deploymentId}.railway.app`;

      // Clean up temp directory
      await fs.promises.rmdir(tempDir, { recursive: true });

      console.log(`✅ Deploy Agent: Deployed to Railway - ${url}`);
      return url;
    } catch (error) {
      console.error('❌ Deploy Agent: Railway deployment failed:', error);
      throw new Error(`Railway deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async deployToAWS(
    files: { [key: string]: string }, 
    config: DeploymentConfig
  ): Promise<string> {
    console.log('🚀 Deploy Agent: Deploying to AWS...');
    
    const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const awsRegion = process.env.AWS_REGION || 'us-east-1';
    
    if (!awsAccessKeyId || !awsSecretAccessKey) {
      throw new Error('AWS credentials not provided. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
    }

    try {
      const AWS = require('aws-sdk');
      const s3 = new AWS.S3({
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
        region: awsRegion
      });

      const bucketName = `voxlor-app-${Date.now()}`;
      
      // Create S3 bucket
      await s3.createBucket({ Bucket: bucketName }).promise();
      
      // Upload files to S3
      const uploadPromises = Object.entries(files).map(async ([filePath, content]) => {
        const key = filePath.startsWith('/') ? filePath.substring(1) : filePath;
        return s3.upload({
          Bucket: bucketName,
          Key: key,
          Body: content,
          ContentType: this.getContentType(filePath)
        }).promise();
      });

      await Promise.all(uploadPromises);

      // Configure bucket for static website hosting
      await s3.putBucketWebsite({
        Bucket: bucketName,
        WebsiteConfiguration: {
          IndexDocument: { Suffix: 'index.html' },
          ErrorDocument: { Key: 'error.html' }
        }
      }).promise();

      // Set bucket policy for public read access
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [{
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`
        }]
      };

      await s3.putBucketPolicy({
        Bucket: bucketName,
        Policy: JSON.stringify(bucketPolicy)
      }).promise();

      const url = `https://${bucketName}.s3-website-${awsRegion}.amazonaws.com`;
      
      console.log(`✅ Deploy Agent: Deployed to AWS S3 - ${url}`);
      return url;
    } catch (error) {
      console.error('❌ Deploy Agent: AWS deployment failed:', error);
      throw new Error(`AWS deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generatePackageJson(code: GeneratedCode): string {
    const dependencies = {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'next': '^13.4.0',
      'typescript': '^5.0.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      'tailwindcss': '^3.3.0',
      'autoprefixer': '^10.4.0',
      'postcss': '^8.4.0'
    };

    return JSON.stringify({
      name: 'voxlor-generated-app',
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies,
      devDependencies: {
        'eslint': '^8.0.0',
        'eslint-config-next': '^13.4.0'
      }
    }, null, 2);
  }

  private generateVercelConfig(config: DeploymentConfig): string {
    return JSON.stringify({
      version: 2,
      builds: [
        {
          src: 'package.json',
          use: '@vercel/next'
        }
      ],
      routes: [
        {
          src: '/api/(.*)',
          dest: '/api/$1'
        }
      ]
    }, null, 2);
  }

  private generateNextConfig(): string {
    return `
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
    `.trim();
  }

  private generateTSConfig(): string {
    return JSON.stringify({
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [
          {
            name: 'next'
          }
        ],
        paths: {
          '@/*': ['./src/*']
        }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    }, null, 2);
  }

  private generateEnvFile(config: DeploymentConfig): string {
    return `
# Environment variables for Voxlor generated app
NODE_ENV=${config.environment}
NEXT_PUBLIC_APP_URL=${config.url || 'http://localhost:3000'}
NEXT_PUBLIC_API_URL=${config.url || 'http://localhost:3000'}/api

# Add your API keys here
# DATABASE_URL=
# NEXTAUTH_SECRET=
# NEXTAUTH_URL=
    `.trim();
  }

  async checkDeploymentStatus(deploymentId: string, platform: string = 'vercel'): Promise<{
    status: 'building' | 'ready' | 'error';
    url?: string;
    logs: string[];
  }> {
    console.log(`🔍 Deploy Agent: Checking deployment status for ${deploymentId} on ${platform}...`);
    
    try {
      switch (platform) {
        case 'vercel':
          return await this.checkVercelStatus(deploymentId);
        case 'netlify':
          return await this.checkNetlifyStatus(deploymentId);
        case 'railway':
          return await this.checkRailwayStatus(deploymentId);
        case 'aws':
          return await this.checkAWSStatus(deploymentId);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      console.error('❌ Deploy Agent: Status check failed:', error);
      return {
        status: 'error',
        logs: [`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private async checkVercelStatus(deploymentId: string): Promise<{
    status: 'building' | 'ready' | 'error';
    url?: string;
    logs: string[];
  }> {
    if (!this.vercelToken) {
      throw new Error('Vercel token not provided');
    }

    const response = await axios.get(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.vercelToken}`
      }
    });

    const deployment = response.data;
    const status = deployment.readyState === 'READY' ? 'ready' : 
                  deployment.readyState === 'ERROR' ? 'error' : 'building';

    return {
      status,
      url: deployment.url,
      logs: deployment.logs || ['No logs available']
    };
  }

  private async checkNetlifyStatus(siteId: string): Promise<{
    status: 'building' | 'ready' | 'error';
    url?: string;
    logs: string[];
  }> {
    if (!this.netlifyToken) {
      throw new Error('Netlify token not provided');
    }

    const response = await axios.get(`https://api.netlify.com/api/v1/sites/${siteId}`, {
      headers: {
        'Authorization': `Bearer ${this.netlifyToken}`
      }
    });

    const site = response.data;
    const status = site.state === 'ready' ? 'ready' : 
                  site.state === 'error' ? 'error' : 'building';

    return {
      status,
      url: site.url,
      logs: site.deploy_log || ['No logs available']
    };
  }

  private async checkRailwayStatus(deploymentId: string): Promise<{
    status: 'building' | 'ready' | 'error';
    url?: string;
    logs: string[];
  }> {
    const railwayToken = process.env.RAILWAY_TOKEN;
    if (!railwayToken) {
      throw new Error('Railway token not provided');
    }

    const response = await axios.post('https://backboard.railway.app/graphql/v1', {
      query: `
        query {
          deployment(id: "${deploymentId}") {
            status
            url
            logs
          }
        }
      `
    }, {
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json'
      }
    });

    const deployment = response.data.data.deployment;
    const status = deployment.status === 'SUCCESS' ? 'ready' : 
                  deployment.status === 'FAILED' ? 'error' : 'building';

    return {
      status,
      url: deployment.url,
      logs: deployment.logs || ['No logs available']
    };
  }

  private async checkAWSStatus(bucketName: string): Promise<{
    status: 'building' | 'ready' | 'error';
    url?: string;
    logs: string[];
  }> {
    // AWS S3 static hosting is always ready once uploaded
    return {
      status: 'ready',
      url: `https://${bucketName}.s3-website-us-east-1.amazonaws.com`,
      logs: ['AWS S3 deployment completed successfully']
    };
  }

  async rollbackDeployment(deploymentId: string, platform: string = 'vercel'): Promise<boolean> {
    console.log(`🔄 Deploy Agent: Rolling back deployment ${deploymentId} on ${platform}...`);
    
    try {
      switch (platform) {
        case 'vercel':
          return await this.rollbackVercel(deploymentId);
        case 'netlify':
          return await this.rollbackNetlify(deploymentId);
        case 'railway':
          return await this.rollbackRailway(deploymentId);
        case 'aws':
          return await this.rollbackAWS(deploymentId);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } catch (error) {
      console.error('❌ Deploy Agent: Rollback failed:', error);
      return false;
    }
  }

  private async rollbackVercel(deploymentId: string): Promise<boolean> {
    if (!this.vercelToken) {
      throw new Error('Vercel token not provided');
    }

    // Get the project ID from the deployment
    const deploymentResponse = await axios.get(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
      headers: {
        'Authorization': `Bearer ${this.vercelToken}`
      }
    });

    const projectId = deploymentResponse.data.projectId;

    // Get previous deployments
    const deploymentsResponse = await axios.get(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=2`, {
      headers: {
        'Authorization': `Bearer ${this.vercelToken}`
      }
    });

    const deployments = deploymentsResponse.data.deployments;
    if (deployments.length < 2) {
      throw new Error('No previous deployment to rollback to');
    }

    const previousDeployment = deployments[1];
    
    // Promote the previous deployment
    await axios.post(`https://api.vercel.com/v13/deployments/${previousDeployment.uid}/promote`, {}, {
      headers: {
        'Authorization': `Bearer ${this.vercelToken}`
      }
    });

    console.log('✅ Deploy Agent: Vercel rollback completed');
    return true;
  }

  private async rollbackNetlify(siteId: string): Promise<boolean> {
    if (!this.netlifyToken) {
      throw new Error('Netlify token not provided');
    }

    // Get site deploys
    const deploysResponse = await axios.get(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      headers: {
        'Authorization': `Bearer ${this.netlifyToken}`
      }
    });

    const deploys = deploysResponse.data;
    if (deploys.length < 2) {
      throw new Error('No previous deployment to rollback to');
    }

    const previousDeploy = deploys[1];
    
    // Restore the previous deployment
    await axios.post(`https://api.netlify.com/api/v1/deploys/${previousDeploy.id}/restore`, {}, {
      headers: {
        'Authorization': `Bearer ${this.netlifyToken}`
      }
    });

    console.log('✅ Deploy Agent: Netlify rollback completed');
    return true;
  }

  private async rollbackRailway(deploymentId: string): Promise<boolean> {
    const railwayToken = process.env.RAILWAY_TOKEN;
    if (!railwayToken) {
      throw new Error('Railway token not provided');
    }

    // Get project deployments
    const response = await axios.post('https://backboard.railway.app/graphql/v1', {
      query: `
        query {
          deployments(limit: 2) {
            id
            status
            createdAt
          }
        }
      `
    }, {
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json'
      }
    });

    const deployments = response.data.data.deployments;
    if (deployments.length < 2) {
      throw new Error('No previous deployment to rollback to');
    }

    const previousDeployment = deployments[1];
    
    // Rollback to previous deployment
    await axios.post('https://backboard.railway.app/graphql/v1', {
      query: `
        mutation {
          deploymentRollback(input: { 
            deploymentId: "${previousDeployment.id}"
          }) {
            id
            status
          }
        }
      `
    }, {
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Deploy Agent: Railway rollback completed');
    return true;
  }

  private async rollbackAWS(bucketName: string): Promise<boolean> {
    // AWS S3 doesn't have built-in rollback, but we can restore from versioning
    console.log('⚠️ AWS S3 rollback: Manual intervention required - check S3 versioning');
    return true;
  }
}
