import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

interface GenerateOptions {
  path: string;
}

// Utilitaires de conversion de noms
function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^[A-Z]/, (match) => match.toLowerCase());
}

function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

async function isExpressOSProject(): Promise<boolean> {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!(await fs.pathExists(packageJsonPath))) {
    return false;
  }

  // Vérifier la structure ExpressOS
  const srcPath = path.join(process.cwd(), "src");
  const frameworkPath = path.join(srcPath, "framework");
  const modulesPath = path.join(srcPath, "modules");

  return (
    (await fs.pathExists(srcPath)) &&
    (await fs.pathExists(frameworkPath)) &&
    (await fs.pathExists(modulesPath))
  );
}

async function updateServicesFile(
  serviceName: string,
  ServiceName: string
): Promise<void> {
  const servicesFilePath = path.join(
    process.cwd(),
    "src",
    "services",
    "services.ts"
  );

  if (!(await fs.pathExists(servicesFilePath))) {
    return;
  }

  let content = await fs.readFile(servicesFilePath, "utf-8");

  // Ajouter l'import
  const importLine = `import { ${serviceName}Service } from './${serviceName}';`;

  if (!content.includes(importLine)) {
    // Trouver où insérer l'import - après les commentaires mais avant export
    const lines = content.split("\n");
    let importInsertIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (
        lines[i].includes("// Services container") ||
        lines[i].trim().startsWith("//")
      ) {
        importInsertIndex = i + 1;
      } else if (lines[i].includes("export const services")) {
        break;
      }
    }

    lines.splice(importInsertIndex, 0, importLine);
    content = lines.join("\n");
  }

  // Ajouter le service dans l'export
  const serviceProperty = `  ${serviceName}: ${serviceName}Service,`;

  if (!content.includes(serviceProperty)) {
    // Trouver et remplacer la fermeture de l'objet services
    const beforeClosing = "  },\n};";
    const afterClosing = `  },\n${serviceProperty}\n};`;

    if (content.includes(beforeClosing)) {
      content = content.replace(beforeClosing, afterClosing);
    }
  }

  await fs.writeFile(servicesFilePath, content);
}

async function generateUseCase(
  name: string,
  options: GenerateOptions
): Promise<void> {
  // Séparer le nom en parties pour supporter les chemins hiérarchiques
  // Ex: "auth create" -> ["auth", "create"]
  const nameParts = name.split(/\s+/);

  let modulePath: string;
  let useCaseName: string;
  let fileName: string;
  let routePath: string;

  if (nameParts.length === 1) {
    // Format simple: "user-management"
    useCaseName = toPascalCase(nameParts[0]);
    fileName = toCamelCase(nameParts[0]);
    modulePath = path.join(process.cwd(), options.path, fileName);
    routePath = toKebabCase(nameParts[0]);
  } else if (nameParts.length === 2) {
    // Format hiérarchique: "auth create"
    const [domain, action] = nameParts;
    useCaseName = toPascalCase(`${domain} ${action}`);
    fileName = toCamelCase(action);
    modulePath = path.join(
      process.cwd(),
      options.path,
      toCamelCase(domain),
      fileName
    );
    routePath = `${toKebabCase(domain)}/${toKebabCase(action)}`;
  } else {
    throw new Error('Use case name should be either "name" or "domain action"');
  }

  // Créer le dossier du module si nécessaire
  await fs.ensureDir(modulePath);

  // Calculer le chemin relatif vers services selon la profondeur
  const depth = nameParts.length === 1 ? 2 : 3; // modules/usecase vs modules/domain/usecase
  const relativePath = "../".repeat(depth);

  // Générer input.ts
  const inputContent = `import { z } from 'zod';

export const ${useCaseName}Input = z.object({
  // TODO: Définir les propriétés d'entrée
  id: z.string().min(1)
});

export type ${useCaseName}InputType = z.infer<typeof ${useCaseName}Input>;
`;

  // Générer output.ts
  const outputContent = `import { z } from 'zod';

export const ${useCaseName}Output = z.object({
  // TODO: Définir les propriétés de sortie
  success: z.boolean(),
  message: z.string()
});

export type ${useCaseName}OutputType = z.infer<typeof ${useCaseName}Output>;
`;

  // Générer useCase.ts
  const useCaseContent = `import { Services } from '${relativePath}services/services';
import { ${useCaseName}InputType } from './input';
import { ${useCaseName}OutputType } from './output';

export async function ${fileName}UseCase(
  input: ${useCaseName}InputType,
  services: Services
): Promise<${useCaseName}OutputType> {
  // TODO: Implémenter la logique métier
  services.logger.info(\`Processing ${fileName}: \${input.id}\`);
  
  return {
    success: true,
    message: \`${useCaseName} executed successfully\`
  };
}
`;

  // Générer index.ts (routes)
  const indexContent = `import { Express } from 'express';
import { createValidatedController } from '${relativePath}framework/createController';
import { ${useCaseName}Input } from './input';
import { ${useCaseName}Output } from './output';
import { ${fileName}UseCase } from './useCase';

export default function ${fileName}Routes(app: Express) {
  app.post('/api/${routePath}', 
    createValidatedController(${fileName}UseCase, ${useCaseName}Input, ${useCaseName}Output)
  );
  
  // TODO: Ajouter d'autres routes si nécessaire
  // app.get('/api/${routePath}/:id', ...)
  // app.put('/api/${routePath}/:id', ...)
  // app.delete('/api/${routePath}/:id', ...)
}
`;

  // Écrire les fichiers
  await fs.writeFile(path.join(modulePath, "input.ts"), inputContent);
  await fs.writeFile(path.join(modulePath, "output.ts"), outputContent);
  await fs.writeFile(path.join(modulePath, "useCase.ts"), useCaseContent);
  await fs.writeFile(path.join(modulePath, "index.ts"), indexContent);

  console.log(
    chalk.green(`✅ Use case '${useCaseName}' created in ${modulePath}`)
  );
  console.log(chalk.cyan("📝 Files generated:"));
  console.log(chalk.white(`  - input.ts (Zod input schema)`));
  console.log(chalk.white(`  - output.ts (Zod output schema)`));
  console.log(chalk.white(`  - useCase.ts (Business logic)`));
  console.log(chalk.white(`  - index.ts (Route definitions)`));
  console.log(chalk.yellow(`\n🔄 Restart your server to load the new routes`));
}

async function generateService(
  name: string,
  options: GenerateOptions
): Promise<void> {
  const serviceName = toCamelCase(name);
  const ServiceName = toPascalCase(name);

  const servicesPath = path.join(process.cwd(), "src", "services");
  const serviceFile = path.join(servicesPath, `${serviceName}.ts`);

  const serviceContent = `export interface I${ServiceName}Service {
  // TODO: Définir l'interface du service
  get(id: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<boolean>;
}

export class ${ServiceName}Service implements I${ServiceName}Service {
  
  async get(id: string): Promise<any> {
    // TODO: Implémenter la récupération
    throw new Error('Method not implemented');
  }

  async create(data: any): Promise<any> {
    // TODO: Implémenter la création
    throw new Error('Method not implemented');
  }

  async update(id: string, data: any): Promise<any> {
    // TODO: Implémenter la mise à jour
    throw new Error('Method not implemented');
  }

  async delete(id: string): Promise<boolean> {
    // TODO: Implémenter la suppression
    throw new Error('Method not implemented');
  }
}

export const ${serviceName}Service = new ${ServiceName}Service();
`;

  await fs.writeFile(serviceFile, serviceContent);

  // Mettre à jour services.ts
  await updateServicesFile(serviceName, ServiceName);

  console.log(
    chalk.green(`✅ Service '${ServiceName}' created in ${serviceFile}`)
  );
  console.log(chalk.cyan("📝 Service interface and implementation generated"));
  console.log(
    chalk.yellow("🔄 Service automatically added to services container")
  );
}

async function generateMiddleware(
  name: string,
  options: GenerateOptions
): Promise<void> {
  const middlewareName = toCamelCase(name);
  const MiddlewareName = toPascalCase(name);

  const middlewaresPath = path.join(process.cwd(), "src", "middlewares");
  await fs.ensureDir(middlewaresPath);

  const middlewareFile = path.join(middlewaresPath, `${middlewareName}.ts`);

  const middlewareContent = `import { Request, Response, NextFunction } from 'express';

export interface ${MiddlewareName}Options {
  // TODO: Définir les options du middleware
  enabled?: boolean;
}

export function ${middlewareName}(options: ${MiddlewareName}Options = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO: Implémenter la logique du middleware
    
    if (!options.enabled) {
      return next();
    }

    console.log(\`${MiddlewareName} middleware executed for \${req.method} \${req.path}\`);
    
    // Exemple: Ajouter des headers, valider des tokens, logger, etc.
    
    next();
  };
}

export default ${middlewareName};
`;

  await fs.writeFile(middlewareFile, middlewareContent);

  console.log(
    chalk.green(
      `✅ Middleware '${MiddlewareName}' created in ${middlewareFile}`
    )
  );
  console.log(
    chalk.cyan("📝 Middleware function and options interface generated")
  );
  console.log(chalk.yellow("🔧 Import and use in your Express app:"));
  console.log(
    chalk.white(
      `  import ${middlewareName} from './middlewares/${middlewareName}';`
    )
  );
  console.log(chalk.white(`  app.use(${middlewareName}({ enabled: true }));`));
}

async function generateModule(
  name: string,
  options: GenerateOptions
): Promise<void> {
  // Pour un module complet, on génère un use case avec des opérations CRUD
  await generateUseCase(name, options);

  console.log(
    chalk.green(`✅ Module '${toPascalCase(name)}' created successfully`)
  );
  console.log(chalk.cyan("📝 Complete module with CRUD operations generated"));
}

export async function generateComponent(
  type: string,
  name: string,
  options: GenerateOptions
): Promise<void> {
  // Vérifier que nous sommes dans un projet ExpressOS
  if (!(await isExpressOSProject())) {
    throw new Error(
      "This command must be run from within an ExpressOS project directory"
    );
  }

  switch (type) {
    case "usecase":
    case "use-case":
      await generateUseCase(name, options);
      break;
    case "service":
      await generateService(name, options);
      break;
    case "middleware":
      await generateMiddleware(name, options);
      break;
    case "module":
      await generateModule(name, options);
      break;
    default:
      throw new Error(
        `Unknown component type: ${type}. Supported types: usecase, service, middleware, module`
      );
  }
}
