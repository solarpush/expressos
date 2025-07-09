import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProjectOptions {
  name: string;
  description?: string;
  author?: string;
  typescript: boolean;
}

export async function createProject(options: ProjectOptions): Promise<void> {
  const projectPath = path.resolve(process.cwd(), options.name);

  // Vérifier si le dossier existe déjà
  if (await fs.pathExists(projectPath)) {
    throw new Error(`Directory "${options.name}" already exists`);
  }

  // Créer le dossier du projet
  await fs.ensureDir(projectPath);

  // Générer la structure du projet
  await generateProjectStructure(projectPath, options);
}

async function generateProjectStructure(
  projectPath: string,
  options: ProjectOptions
): Promise<void> {
  // Variables pour les templates
  const templateVars = {
    projectName: options.name,
    description:
      options.description || "An Express service with clean architecture",
    author: options.author || "ExpressOS Team",
    typescript: options.typescript,
    year: new Date().getFullYear(),
  };

  // Structure de base
  const baseStructure = [
    "src",
    "src/framework",
    "src/modules",
    "src/services",
    "src/middlewares",
    "src/configs",
  ];

  // Créer la structure de dossiers
  for (const dir of baseStructure) {
    await fs.ensureDir(path.join(projectPath, dir));
  }

  // Générer les fichiers de base
  await generatePackageJson(projectPath, templateVars);
  await generateTsConfig(projectPath);
  await generateEslintConfig(projectPath);
  await generateReadme(projectPath, templateVars);
  await generateGitignore(projectPath);
  await generateFrameworkFiles(projectPath);
  await generateMainFiles(projectPath, templateVars);
  await generateExampleModule(projectPath);
}

async function generatePackageJson(
  projectPath: string,
  vars: any
): Promise<void> {
  const packageJson = {
    name: vars.projectName,
    version: "1.0.0",
    description: vars.description,
    main: vars.typescript ? "dist/index.js" : "src/index.js",
    scripts: {
      ...(vars.typescript && {
        build: "tsc",
        dev: "ts-node-dev --respawn --transpile-only src/index.ts",
        start: "node dist/index.js",
      }),
      ...(!vars.typescript && {
        dev: "nodemon src/index.js",
        start: "node src/index.js",
      }),
      lint: "eslint src/**/*",
      "lint:fix": "eslint src/**/* --fix",
      test: 'echo "Error: no test specified" && exit 1',
    },
    keywords: ["express", "api", "clean-architecture"],
    author: vars.author,
    license: "MIT",
    dependencies: {
      express: "^4.18.2",
      cors: "^2.8.5",
      helmet: "^7.1.0",
      zod: "^3.22.4",
    },
    devDependencies: {
      ...(vars.typescript && {
        "@types/express": "^4.17.21",
        "@types/cors": "^2.8.17",
        "@types/node": "^20.10.6",
        "ts-node-dev": "^2.0.0",
        typescript: "^5.3.3",
      }),
      ...(!vars.typescript && {
        nodemon: "^3.0.2",
      }),
      eslint: "^8.56.0",
      "@typescript-eslint/eslint-plugin": "^6.19.0",
      "@typescript-eslint/parser": "^6.19.0",
    },
  };

  await fs.writeJson(path.join(projectPath, "package.json"), packageJson, {
    spaces: 2,
  });
}

async function generateTsConfig(projectPath: string): Promise<void> {
  const tsConfig = {
    compilerOptions: {
      target: "ES2020",
      module: "commonjs",
      outDir: "./dist",
      rootDir: "./src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      allowSyntheticDefaultImports: true,
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"],
  };

  await fs.writeJson(path.join(projectPath, "tsconfig.json"), tsConfig, {
    spaces: 2,
  });
}

async function generateEslintConfig(projectPath: string): Promise<void> {
  const eslintConfig = `module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    '@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },
};
`;

  await fs.writeFile(path.join(projectPath, ".eslintrc.js"), eslintConfig);
}

async function generateReadme(projectPath: string, vars: any): Promise<void> {
  const readme = `# ${vars.projectName}

${vars.description}

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
npm start
\`\`\`

## API Structure

This project follows a clean architecture pattern:

- \`src/framework/\` - Core framework utilities
- \`src/modules/\` - Business logic modules
- \`src/services/\` - External services
- \`src/middlewares/\` - Express middlewares
- \`src/configs/\` - Configuration files

## Usage

### Local Development

\`\`\`typescript
import { createApp } from './src/index';

const app = createApp();
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

### Firebase Functions

\`\`\`typescript
import { onRequest } from 'firebase-functions/v2/https';
import { createApp } from './src/index';

// Create the Express app
const app = createApp();

// Export as Firebase Function
export const api = onRequest(app);
\`\`\`

### Vercel

\`\`\`typescript
import { createApp } from './src/index';

export default createApp();
\`\`\`

## API Structure

This project follows a clean architecture pattern:

- \`src/framework/\` - Core framework utilities
- \`src/modules/\` - Business logic modules
- \`src/services/\` - External services
- \`src/middlewares/\` - Express middlewares
- \`src/configs/\` - Configuration files

### Modules

Modules are automatically loaded by the framework. Each module should export a default function that takes an Express app:

\`\`\`typescript
// src/modules/auth/login/index.ts
import { Express } from 'express';

export default function loginRoutes(app: Express) {
  app.post('/api/auth/login', (req, res) => {
    // Route logic
  });
}
\`\`\`

## API Endpoints

- \`GET /api/health\` - Health check
- \`GET /api/example\` - Example endpoint

## Generated by ExpressOS

This project was generated using [ExpressOS](https://github.com/yourusername/expressos), a CLI tool for creating Express services with clean architecture.

## License

MIT
`;

  await fs.writeFile(path.join(projectPath, "README.md"), readme);
}

async function generateGitignore(projectPath: string): Promise<void> {
  const gitignore = `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
`;

  await fs.writeFile(path.join(projectPath, ".gitignore"), gitignore);
}

async function generateFrameworkFiles(projectPath: string): Promise<void> {
  // createController.ts
  const createController = `import { Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { services } from "../services/services";

export function createValidatedController<TInput, TOutput>(
  useCase: (input: TInput, service: typeof services) => Promise<TOutput>,
  inputSchema: ZodTypeAny,
  outputSchema?: ZodTypeAny
) {
  return async (req: Request, res: Response) => {
    const parseResult = inputSchema.safeParse(req.body);

    if (!parseResult.success) {
      res
        .status(400)
        .json({ error: "Invalid input", details: parseResult.error.format() });
      return;
    }

    try {
      const result = await useCase(parseResult.data, services);

      if (outputSchema) {
        const out = outputSchema.safeParse(result);
        if (!out.success) {
          res
            .status(500)
            .json({ error: "Invalid output", details: out.error.format() });
          return;
        }
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
`;

  await fs.writeFile(
    path.join(projectPath, "src/framework/createController.ts"),
    createController
  );

  // loadRoutes.ts
  const loadRoutes = `import { Express } from 'express';
import fs from 'fs';
import path from 'path';

export function loadRoutes(app: Express): void {
  const modulesPath = path.join(__dirname, '..', 'modules');
  
  if (!fs.existsSync(modulesPath)) {
    return;
  }

  // Fonction récursive pour charger les routes des modules et sous-modules
  function loadModuleRoutes(currentPath: string): void {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Vérifier s'il y a un index.ts/js dans ce dossier
        const indexPath = path.join(itemPath, 'index');
        try {
          // Import synchrone avec require
          const moduleRoutes = require(indexPath);
          if (moduleRoutes.default && typeof moduleRoutes.default === 'function') {
            moduleRoutes.default(app);
          }
        } catch (error) {
          // Si pas d'index dans ce dossier, explorer récursivement
          loadModuleRoutes(itemPath);
        }
      }
    }
  }
  
  loadModuleRoutes(modulesPath);
}
`;

  await fs.writeFile(
    path.join(projectPath, "src/framework/loadRoutes.ts"),
    loadRoutes
  );
}

async function generateMainFiles(
  projectPath: string,
  vars: any
): Promise<void> {
  // index.ts
  const indexContent = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { loadRoutes } from './framework/loadRoutes';

export function createApp(): express.Express {
  const app = express();

  // Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Load module routes
  loadRoutes(app);

  return app;
}

// Pour l'exécution locale
if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(\`🚀 Server running on port \${PORT}\`);
  });
}

// Export pour Firebase Functions ou autres usages
export default createApp;
`;

  await fs.writeFile(path.join(projectPath, "src/index.ts"), indexContent);

  // services.ts
  const servicesContent = `// Services container
export const services = {
  // Add your services here
  logger: {
    info: (message: string) => console.log(message),
    error: (message: string) => console.error(message),
  },
};

export type Services = typeof services;
`;

  await fs.writeFile(
    path.join(projectPath, "src/services/services.ts"),
    servicesContent
  );
}

async function generateExampleModule(projectPath: string): Promise<void> {
  const examplePath = path.join(projectPath, "src/modules/example");
  await fs.ensureDir(examplePath);

  // input.ts
  const input = `import { z } from 'zod';

export const ExampleInput = z.object({
  message: z.string().min(1)
});

export type ExampleInputType = z.infer<typeof ExampleInput>;
`;

  await fs.writeFile(path.join(examplePath, "input.ts"), input);

  // output.ts
  const output = `import { z } from 'zod';

export const ExampleOutput = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string()
});

export type ExampleOutputType = z.infer<typeof ExampleOutput>;
`;

  await fs.writeFile(path.join(examplePath, "output.ts"), output);

  // useCase.ts
  const useCase = `import { Services } from '../../services/services';
import { ExampleInputType } from './input';
import { ExampleOutputType } from './output';

export async function exampleUseCase(
  input: ExampleInputType,
  services: Services
): Promise<ExampleOutputType> {
  services.logger.info(\`Processing example: \${input.message}\`);
  
  return {
    success: true,
    message: \`Hello, \${input.message}!\`,
    timestamp: new Date().toISOString()
  };
}
`;

  await fs.writeFile(path.join(examplePath, "useCase.ts"), useCase);

  // index.ts
  const moduleIndex = `import { Express } from 'express';
import { createValidatedController } from '../../framework/createController';
import { ExampleInput } from './input';
import { ExampleOutput } from './output';
import { exampleUseCase } from './useCase';

export default function exampleRoutes(app: Express) {
  app.post('/api/example', 
    createValidatedController(exampleUseCase, ExampleInput, ExampleOutput)
  );
}
`;

  await fs.writeFile(path.join(examplePath, "index.ts"), moduleIndex);
}
