#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import fs from "fs";
import inquirer from "inquirer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const program = new Command();
//@ts-check
program
  .name("expressos")
  .description("CLI pour gérer vos projets Expresso")
  .version("0.0.0");

program
  .command("create case <domain> <caseName>")
  .description("Créer un nouvel élément (ex: case, project, etc.)")
  .action((type: string, domain: string, caseName: string) => {
    if (type === "case") {
      console.log('Création d’une nouvelle "case"... dans le domain ');
      // Ajoute ici la logique pour créer une "case".
    } else {
      console.log(`Type "${type}" non reconnu.`);
    }
  });

// Sous-commande "start"
program
  .command("init")
  .description("Démarrer le projet actuel")
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Nom du projet :",
        default: "expresso-app",
      },
    ]);

    const projectName = answers.projectName;
    main(projectName).catch((err) => console.error(err));
  });

program
  .command("help")
  .description("Afficher l’aide pour toutes les commandes")
  .action(() => {
    console.log(`
Commandes disponibles :
  expressos init                 Initialiser un nouveau projet Expresso
  expressos create case <domain> <caseName>  Créer une nouvelle "case"
  expressos help                 Afficher cette aide
    `);
  });

program.parse(process.argv);

// Fonction principale
async function main(projectName: string) {
  const targetDir = path.join(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error("⚠️ Le répertoire existe déjà. Choisissez un autre nom.");
    process.exit(1);
  }

  console.log(`Création du projet ${projectName}...`);
  fs.mkdirSync(targetDir, { recursive: true });
  const templateDir = path.join(__dirname, "template");
  copyFolderSync(templateDir, targetDir);

  console.log(chalk.green("✅ Projet créé avec succès!"));
  console.log(chalk.blue(`📁 Allez dans le dossier : cd ${projectName}`));
  console.log(chalk.yellow("🔧 Installez les dépendances : npm install"));
  console.log(chalk.magenta("🚀 Lancez le projet : npm run dev"));
}

function copyFolderSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    fs.statSync(srcFile).isDirectory()
      ? copyFolderSync(srcFile, destFile)
      : fs.copyFileSync(srcFile, destFile);
  }
}
