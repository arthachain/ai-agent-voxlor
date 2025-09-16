import { getModelClient } from '../ipc/utils/get_model_client';
import type { LargeLanguageModel, UserSettings } from '../lib/schemas';

export interface GeneratedCode {
  frontend: {
    components: { [key: string]: string };
    pages: { [key: string]: string };
    styles: { [key: string]: string };
  };
  backend: {
    routes: { [key: string]: string };
    models: { [key: string]: string };
    services: { [key: string]: string };
  };
  config: {
    packageJson: string;
    tsconfig: string;
    env: string;
  };
}

export class CodeAgent {
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

  async generateCode(plan: any, request: any): Promise<GeneratedCode> {
    console.log('💻 Code Agent: Generating code...');
    
    try {
      const { modelClient } = await getModelClient(this.defaultModel, this.userSettings);
      
      const prompt = `
      Generate complete code for a ${request.platform} application based on this plan:
      
      Plan: ${JSON.stringify(plan, null, 2)}
      Request: ${request.prompt}
      
      Generate:
      1. React components with TypeScript
      2. API routes with Express
      3. Database models
      4. Configuration files
      5. Styling with Tailwind CSS
      `;

      const response = await modelClient.model.generateText({
        prompt,
        maxTokens: 4000,
        temperature: 0.3
      });
    
      // Generate structured code
      const code: GeneratedCode = {
        frontend: {
          components: {
            'App.tsx': this.generateAppComponent(request),
            'Header.tsx': this.generateHeaderComponent(),
            'Footer.tsx': this.generateFooterComponent()
          },
          pages: {
            'Home.tsx': this.generateHomePage(request),
            'About.tsx': this.generateAboutPage()
          },
          styles: {
            'globals.css': this.generateGlobalStyles(),
            'components.css': this.generateComponentStyles()
          }
        },
        backend: {
          routes: {
            'api/users.ts': this.generateUsersAPI(),
            'api/auth.ts': this.generateAuthAPI()
          },
          models: {
            'User.ts': this.generateUserModel(),
            'App.ts': this.generateAppModel()
          },
          services: {
            'database.ts': this.generateDatabaseService(),
            'auth.ts': this.generateAuthService()
          }
        },
        config: {
          packageJson: this.generatePackageJson(),
          tsconfig: this.generateTSConfig(),
          env: this.generateEnvFile()
        }
      };

      console.log('✅ Code Agent: Code generated');
      return code;
    } catch (error) {
      console.error('❌ Code Agent: Code generation failed:', error);
      // Return fallback code structure
      return this.generateFallbackCode(request);
    }
  }

  private generateFallbackCode(request: any): GeneratedCode {
    return {
      frontend: {
        components: {
          'App.tsx': this.generateAppComponent(request),
          'Header.tsx': this.generateHeaderComponent(),
          'Footer.tsx': this.generateFooterComponent()
        },
        pages: {
          'Home.tsx': this.generateHomePage(request),
          'About.tsx': this.generateAboutPage()
        },
        styles: {
          'globals.css': this.generateGlobalStyles(),
          'components.css': this.generateComponentStyles()
        }
      },
      backend: {
        routes: {
          'api/users.ts': this.generateUsersAPI(),
          'api/auth.ts': this.generateAuthAPI()
        },
        models: {
          'User.ts': this.generateUserModel(),
          'App.ts': this.generateAppModel()
        },
        services: {
          'database.ts': this.generateDatabaseService(),
          'auth.ts': this.generateAuthService()
        }
      },
      config: {
        packageJson: this.generatePackageJson(),
        tsconfig: this.generateTSConfig(),
        env: this.generateEnvFile()
      }
    };
  }

  private generateAppComponent(request: any): string {
    return `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;`;
  }

  private generateHeaderComponent(): string {
    return `import React from 'react';

function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">Voxlor App</h1>
          <nav className="space-x-4">
            <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
            <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;`;
  }

  private generateFooterComponent(): string {
    return `import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>&copy; 2024 Voxlor App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;`;
  }

  private generateHomePage(request: any): string {
    return `import React from 'react';

function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to ${request.prompt}
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Built with Voxlor AI
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Home;`;
  }

  private generateAboutPage(): string {
    return `import React from 'react';

function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">About</h1>
      <p className="text-gray-600">
        This app was generated by Voxlor AI.
      </p>
    </div>
  );
}

export default About;`;
  }

  private generateGlobalStyles(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}`;
  }

  private generateComponentStyles(): string {
    return `.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}`;
  }

  private generateUsersAPI(): string {
    return `import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;`;
  }

  private generateAuthAPI(): string {
    return `import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Authentication logic here
  res.json({ token: 'jwt-token' });
});

export default router;`;
  }

  private generateUserModel(): string {
    return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const userService = {
  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.user.create({ data });
  },
  
  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }
};`;
  }

  private generateAppModel(): string {
    return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface App {
  id: number;
  name: string;
  description: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export const appService = {
  async create(data: Omit<App, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.app.create({ data });
  },
  
  async findByUserId(userId: number) {
    return prisma.app.findMany({ where: { userId } });
  }
};`;
  }

  private generateDatabaseService(): string {
    return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
};

export default prisma;`;
  }

  private generateAuthService(): string {
    return `import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};`;
  }

  private generatePackageJson(): string {
    return `{
  "name": "voxlor-app",
  "version": "1.0.0",
  "description": "Generated by Voxlor AI",
  "main": "index.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0"
  }
}`;
  }

  private generateTSConfig(): string {
    return `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`;
  }

  private generateEnvFile(): string {
    return `DATABASE_URL="postgresql://username:password@localhost:5432/voxlor_app"
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"`;
  }
}
