#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";
import ora from "ora";
import { createProject } from "./generator.js";
import { generateComponent } from "./generators.js";
import { validateProjectName } from "./utils.js";

const program = new Command();

interface ProjectOptions {
  name: string;
  description?: string;
  author?: string;
  typescript: boolean;
}

program
  .name("expressos")
  .description("Create Express services with clean architecture")
  .version("1.1.0");

program
  .argument("[project-name]", "name of the project")
  .option("-t, --typescript", "use TypeScript", true)
  .action(async (projectName: string, options: any) => {
    console.log(chalk.blue.bold("\n🚀 Welcome to ExpressOS!\n"));

    let projectOptions: ProjectOptions;

    if (projectName && !options.interactive) {
      // Mode non-interactif avec les options par défaut
      projectOptions = {
        name: projectName,
        typescript: options.typescript,
      };
    } else {
      // Mode interactif
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "What is your project name?",
          default: projectName || "my-express-service",
          validate: validateProjectName,
        },
        {
          type: "input",
          name: "description",
          message: "Project description:",
          default: "An Express service with clean architecture",
        },
        {
          type: "input",
          name: "author",
          message: "Author name:",
          default: "ExpressOS Team",
        },
        {
          type: "confirm",
          name: "typescript",
          message: "Use TypeScript?",
          default: true,
        },
      ]);

      projectOptions = answers as ProjectOptions;
    }

    const spinner = ora("Creating project...").start();

    try {
      await createProject(projectOptions);
      spinner.succeed(chalk.green("Project created successfully!"));

      console.log(chalk.cyan("\n📝 Next steps:"));
      console.log(chalk.white(`  cd ${projectOptions.name}`));
      console.log(chalk.white("  npm install"));
      console.log(chalk.white("  npm run dev"));

      console.log(chalk.green("\n✨ Happy coding!\n"));
    } catch (error) {
      spinner.fail(chalk.red("Failed to create project"));
      console.error(
        chalk.red(error instanceof Error ? error.message : "Unknown error")
      );
      process.exit(1);
    }
  });

// Commandes pour générer des composants
program
  .command("usecase <domain> [action]")
  .description("Generate a new use case with input/output validation")
  .option("-p, --path <path>", "target path", "src/modules")
  .action(async (domain: string, action: string | undefined, options: any) => {
    try {
      // Construire le nom basé sur les arguments fournis
      const name = action ? `${domain} ${action}` : domain;
      await generateComponent("usecase", name, options);
    } catch (error) {
      console.error(
        chalk.red(error instanceof Error ? error.message : "Unknown error")
      );
      process.exit(1);
    }
  });

program
  .command("service <n>")
  .description("Generate a new service with CRUD interface")
  .action(async (name: string, options: any) => {
    try {
      await generateComponent("service", name, { path: "src/services" });
    } catch (error) {
      console.error(
        chalk.red(error instanceof Error ? error.message : "Unknown error")
      );
      process.exit(1);
    }
  });

program
  .command("middleware <n>")
  .description("Generate a new Express middleware")
  .action(async (name: string, options: any) => {
    try {
      await generateComponent("middleware", name, { path: "src/middlewares" });
    } catch (error) {
      console.error(
        chalk.red(error instanceof Error ? error.message : "Unknown error")
      );
      process.exit(1);
    }
  });

// Commande générique pour générer des modules
program
  .command("generate <type>")
  .alias("g")
  .description("Generate modules, controllers, or use cases")
  .argument("<n>", "name of the component")
  .option("-p, --path <path>", "target path", "src/modules")
  .action(async (type: string, name: string, options: any) => {
    try {
      await generateComponent(type, name, options);
    } catch (error) {
      console.error(
        chalk.red(error instanceof Error ? error.message : "Unknown error")
      );
      process.exit(1);
    }
  });

program.parse();
