import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { IpcClient } from '../ipc/ipc_client';
import { 
  Play, 
  Code, 
  Rocket, 
  Search, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Eye,
  Zap,
  Gamepad2
} from 'lucide-react';
import { SampleGameGenerator } from './SampleGameGenerator';

interface AppGenerationResult {
  appName: string;
  description: string;
  platform: string;
  code: any;
  deploymentUrl?: string;
  status: 'generating' | 'completed' | 'error';
  progress: number;
}

interface DeploymentStatus {
  status: 'building' | 'ready' | 'error';
  url?: string;
  logs: string[];
}

export function AIAgentDashboard() {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('web');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentApp, setCurrentApp] = useState<AppGenerationResult | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [availableModels, setAvailableModels] = useState<any>(null);
  const [showSampleGames, setShowSampleGames] = useState(false);

  // Load available models on component mount
  useEffect(() => {
    loadAvailableModels();
  }, []);

  const loadAvailableModels = async () => {
    try {
      // Simplified model loading for demonstration
      setAvailableModels({
        currentModel: { provider: 'auto', name: 'auto' },
        availableProviders: ['openai', 'anthropic', 'google', 'openrouter', 'ollama', 'lmstudio'],
        modelClient: 'connected'
      });
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const handleGenerateApp = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setCurrentApp({
      appName: 'Generating...',
      description: 'Creating your app...',
      platform,
      code: null,
      status: 'generating',
      progress: 0
    });

    try {
      // Simulate app generation with progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setCurrentApp(prev => prev ? { ...prev, progress: i } : null);
      }

      // Generate the app result
      const result = {
        appName: `Generated ${platform} App`,
        description: `AI-generated ${platform} application based on: ${prompt}`,
        platform,
        code: {
          frontend: {
            'index.html': `<!DOCTYPE html>
<html>
<head>
    <title>${prompt} - Generated App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Your Generated App!</h1>
        <p>This is a ${platform} application generated from: "${prompt}"</p>
        <div class="features">
            <h2>Features:</h2>
            <ul>
                <li>Responsive design</li>
                <li>Modern UI components</li>
                <li>Interactive elements</li>
                <li>Cross-platform compatibility</li>
            </ul>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
            'style.css': `body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    color: white;
}

h1 {
    font-size: 2.5em;
    margin-bottom: 20px;
    text-align: center;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

p {
    font-size: 1.2em;
    text-align: center;
    margin-bottom: 30px;
    opacity: 0.9;
}

.features {
    background: rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.features h2 {
    margin-top: 0;
    color: #fff;
}

.features ul {
    list-style: none;
    padding: 0;
}

.features li {
    padding: 10px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.features li:before {
    content: "✨ ";
    margin-right: 10px;
}`,
            'script.js': `console.log('Generated app is running!');

// Add some interactivity
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    
    // Add click animation
    container.addEventListener('click', function() {
        this.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 200);
    });
    
    // Add hover effects
    const features = document.querySelectorAll('.features li');
    features.forEach(feature => {
        feature.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        feature.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });
    });
});`
          }
        },
        status: 'completed',
        progress: 100
      };

      setCurrentApp(result);
    } catch (error) {
      console.error('App generation failed:', error);
      setCurrentApp(prev => prev ? { ...prev, status: 'error' } : null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployApp = async () => {
    if (!currentApp?.code) return;

    try {
      setDeploymentStatus({
        status: 'building',
        logs: ['Deployment started...', 'Uploading files...', 'Building application...']
      });

      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const deploymentUrl = `https://generated-app-${Date.now()}.vercel.app`;
      
      setDeploymentStatus({
        status: 'ready',
        url: deploymentUrl,
        logs: ['Deployment completed successfully!', `App is live at: ${deploymentUrl}`]
      });
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentStatus({
        status: 'error',
        logs: [`Deployment failed: ${error}`]
      });
    }
  };

  const handleOptimizeCode = async () => {
    if (!currentApp?.code) return;

    try {
      // Simulate code optimization
      console.log('Optimizing code...');
      // In a real implementation, this would optimize the code
      setCurrentApp(prev => prev ? { ...prev, code: prev.code } : null);
    } catch (error) {
      console.error('Code optimization failed:', error);
    }
  };

  const handleResearch = async () => {
    if (!prompt.trim()) return;

    try {
      // Simulate research
      console.log('Researching topic:', prompt);
      // In a real implementation, this would perform research
    } catch (error) {
      console.error('Research failed:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Agent Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Generate, deploy, and optimize apps with AI
            </p>
          </div>

          <Separator />

          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                App Description
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your app idea... (e.g., 'Create a social media dashboard with analytics')"
                className="min-h-[100px]"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isGenerating}
              >
                <option value="web">Web App</option>
                <option value="mobile">Mobile App</option>
                <option value="desktop">Desktop App</option>
              </select>
            </div>

            <Button
              onClick={handleGenerateApp}
              disabled={!prompt.trim() || isGenerating}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate App'}
            </Button>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Actions</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResearch}
              className="w-full justify-start"
            >
              <Search className="w-4 h-4 mr-2" />
              Research Topic
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAvailableModels}
              className="w-full justify-start"
            >
              <Settings className="w-4 h-4 mr-2" />
              Refresh Models
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSampleGames(!showSampleGames)}
              className="w-full justify-start"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              {showSampleGames ? 'Hide' : 'Show'} Sample Games
            </Button>
          </div>

          {/* Model Status */}
          {availableModels && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Models</h3>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div>Provider: {availableModels.currentModel?.provider || 'Auto'}</div>
                <div>Status: {availableModels.modelClient || 'Unknown'}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {currentApp?.appName || 'AI App Generator'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {currentApp?.description || 'Generate amazing apps with AI'}
              </p>
            </div>
            
            {currentApp && (
              <div className="flex space-x-2">
                <Button
                  onClick={handleOptimizeCode}
                  variant="outline"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Optimize
                </Button>
                <Button
                  onClick={handleDeployApp}
                  disabled={!currentApp.code || deploymentStatus?.status === 'building'}
                  size="sm"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 space-y-6">
          {showSampleGames ? (
            <SampleGameGenerator />
          ) : !currentApp ? (
            <div className="text-center py-12">
              <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ready to Generate
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your app description and click "Generate App" to get started
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* App Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {currentApp.status === 'generating' && <Clock className="w-5 h-5 mr-2 text-blue-500" />}
                    {currentApp.status === 'completed' && <CheckCircle className="w-5 h-5 mr-2 text-green-500" />}
                    {currentApp.status === 'error' && <XCircle className="w-5 h-5 mr-2 text-red-500" />}
                    App Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-medium">{currentApp.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${currentApp.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant={currentApp.status === 'completed' ? 'default' : 'secondary'}>
                        {currentApp.status}
                      </Badge>
                      <Badge variant="outline">{currentApp.platform}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployment Status */}
              {deploymentStatus && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Rocket className="w-5 h-5 mr-2" />
                      Deployment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          deploymentStatus.status === 'ready' ? 'default' : 
                          deploymentStatus.status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {deploymentStatus.status}
                        </Badge>
                        {deploymentStatus.url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={deploymentStatus.url} target="_blank" rel="noopener noreferrer">
                              <Eye className="w-4 h-4 mr-2" />
                              View App
                            </a>
                          </Button>
                        )}
                      </div>
                      {deploymentStatus.logs.length > 0 && (
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3">
                          <div className="text-xs font-mono text-gray-600 dark:text-gray-400">
                            {deploymentStatus.logs.map((log, index) => (
                              <div key={index}>{log}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Code Preview */}
              {currentApp.code && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Code className="w-5 h-5 mr-2" />
                      Generated Code
                    </CardTitle>
                    <CardDescription>
                      Your app code has been generated successfully
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm">
                        <code>{JSON.stringify(currentApp.code, null, 2).substring(0, 500)}...</code>
                      </pre>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Code
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
