import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function copyFolderSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    console.log(file);
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    if (fs.lstatSync(srcFile).isDirectory()) {
      copyFolderSync(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  }
}

const srcDir = path.resolve(__dirname, "template");
const destDir = path.resolve(__dirname, "../dist/template");

copyFolderSync(srcDir, destDir);
console.log('✅ Dossier "template" copié avec succès.');
