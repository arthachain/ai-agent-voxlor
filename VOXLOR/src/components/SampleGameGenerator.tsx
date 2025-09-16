import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { IpcClient } from '../ipc/ipc_client';
import { Play, Code, Rocket, Gamepad2 } from 'lucide-react';

interface GameTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  features: string[];
  estimatedTime: string;
}

const GAME_TEMPLATES: GameTemplate[] = [
  {
    id: 'snake',
    name: 'Snake Game',
    description: 'Classic snake game with score tracking and game over screen',
    difficulty: 'easy',
    features: ['Arrow key controls', 'Score system', 'Game over detection', 'Food spawning'],
    estimatedTime: '30 minutes'
  },
  {
    id: 'tetris',
    name: 'Tetris',
    description: 'Block stacking puzzle game with line clearing mechanics',
    difficulty: 'medium',
    features: ['Block rotation', 'Line clearing', 'Level progression', 'Score multiplier'],
    estimatedTime: '1 hour'
  },
  {
    id: 'pong',
    name: 'Pong',
    description: 'Classic paddle ball game with AI opponent',
    difficulty: 'easy',
    features: ['Paddle controls', 'Ball physics', 'AI opponent', 'Score tracking'],
    estimatedTime: '45 minutes'
  },
  {
    id: 'breakout',
    name: 'Breakout',
    description: 'Brick breaking game with power-ups and multiple levels',
    difficulty: 'medium',
    features: ['Brick destruction', 'Power-ups', 'Multiple levels', 'Paddle controls'],
    estimatedTime: '1.5 hours'
  },
  {
    id: 'space-invaders',
    name: 'Space Invaders',
    description: 'Shoot em up game with enemy waves and power-ups',
    difficulty: 'hard',
    features: ['Enemy waves', 'Shooting mechanics', 'Power-ups', 'Progressive difficulty'],
    estimatedTime: '2 hours'
  }
];

export function SampleGameGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<any>(null);

  const handleGenerateGame = async (template: GameTemplate) => {
    setIsGenerating(true);
    setSelectedTemplate(template);

    try {
      // Simulate game generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = {
        appName: template.name,
        description: template.description,
        platform: 'web',
        code: {
          frontend: {
            'index.html': `<!DOCTYPE html>
<html>
<head>
    <title>${template.name}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="game-container">
        <h1>${template.name}</h1>
        <canvas id="gameCanvas" width="800" height="600"></canvas>
        <div class="controls">
            <p>Use arrow keys to play!</p>
            <button id="startBtn">Start Game</button>
            <button id="pauseBtn">Pause</button>
        </div>
        <div class="score">Score: <span id="score">0</span></div>
    </div>
    <script src="game.js"></script>
</body>
</html>`,
            'style.css': `body {
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    font-family: 'Arial', sans-serif;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.game-container {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

h1 {
    margin-bottom: 20px;
    font-size: 2.5em;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}

#gameCanvas {
    border: 3px solid #fff;
    border-radius: 10px;
    background: #000;
    margin: 20px 0;
}

.controls {
    margin: 20px 0;
}

button {
    background: #4CAF50;
    border: none;
    color: white;
    padding: 10px 20px;
    margin: 0 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}

button:hover {
    background: #45a049;
}

.score {
    font-size: 1.5em;
    margin-top: 20px;
    font-weight: bold;
}`,
            'game.js': `// ${template.name} - Generated Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

let gameRunning = false;
let score = 0;

// Game state
let gameObjects = [];
let keys = {};

// Initialize game
function init() {
    // Add event listeners
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', pauseGame);
    
    // Initialize game objects based on template
    initializeGameObjects();
}

function initializeGameObjects() {
    // This would be customized based on the game template
    // For now, we'll create a simple example
    gameObjects = [];
}

function startGame() {
    gameRunning = true;
    startBtn.textContent = 'Restart';
    gameLoop();
}

function pauseGame() {
    gameRunning = !gameRunning;
    if (gameRunning) {
        pauseBtn.textContent = 'Pause';
        gameLoop();
    } else {
        pauseBtn.textContent = 'Resume';
    }
}

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Game logic would go here
    // This is where the specific game mechanics would be implemented
    // based on the template (Snake, Tetris, Pong, etc.)
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game objects
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('${template.name} - Ready to Play!', canvas.width/2, canvas.height/2);
    ctx.fillText('Click Start to begin', canvas.width/2, canvas.height/2 + 30);
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', init);`
          }
        },
        status: 'completed',
        progress: 100
      };

      setGeneratedGame(result);
    } catch (error) {
      console.error('Game generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployGame = async () => {
    if (!generatedGame?.code) return;

    try {
      // Simulate deployment
      console.log('Deploying game...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const deploymentUrl = `https://${generatedGame.appName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.vercel.app`;
      console.log('Game deployed:', deploymentUrl);
      
      // Open the deployed game in a new tab
      window.open(deploymentUrl, '_blank');
    } catch (error) {
      console.error('Game deployment failed:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sample Game Generator
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test the AI Agent system with these sample game projects
        </p>
      </div>

      {!generatedGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAME_TEMPLATES.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    {template.name}
                  </CardTitle>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
                <CardDescription>
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Features:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {template.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-sm text-gray-500">
                      Est. {template.estimatedTime}
                    </span>
                    <Button
                      onClick={() => handleGenerateGame(template)}
                      disabled={isGenerating}
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isGenerating && selectedTemplate?.id === template.id ? 'Generating...' : 'Generate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Generated Game: {generatedGame.appName}
              </CardTitle>
              <CardDescription>
                {generatedGame.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-md p-4">
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    <code>
                      {JSON.stringify(generatedGame.code, null, 2).substring(0, 1000)}...
                    </code>
                  </pre>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleDeployGame}>
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy Game
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setGeneratedGame(null)}
                  >
                    Generate Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Generating {selectedTemplate?.name}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
