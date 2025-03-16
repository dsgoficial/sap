import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define folder names
const SRC_FOLDER_NAME = 'src';
const DEST_FOLDER_NAME = 'src_total';

// Lista de pastas para ignorar
const FOLDERS_TO_IGNORE = ['.git', 'node_modules', 'vendors', 'images', 'assets'];

function readGitignore(projectRoot) {
    const gitignorePath = path.join(projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const content = fs.readFileSync(gitignorePath, 'utf8');
        return ignore().add(content.split('\n'));
    }
    return ignore();
}

function shouldIgnore(item, relativePath, ig) {
    // Verifica se o item está na lista de pastas para ignorar
    if (FOLDERS_TO_IGNORE.includes(item)) {
        return true;
    }
    // Verifica se o item deve ser ignorado pelo .gitignore
    return ig.ignores(relativePath);
}

// Function to copy and rename files from src to src_total
function copyFilesToDestination(srcDir, destDir, currentDir, ig) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relativePath = path.relative(srcDir, fullPath);

        if (shouldIgnore(item, relativePath, ig)) continue;

        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // Recursive call for directories
            copyFilesToDestination(srcDir, destDir, fullPath, ig);
        } else {
            // Process the file
            const pathParts = relativePath.split(path.sep);
            const newFileName = pathParts.join('_');
            const destPath = path.join(destDir, newFileName);
            
            // Copy the file with the new name
            fs.copyFileSync(fullPath, destPath);
            console.log(`Copied: ${relativePath} -> ${newFileName}`);
        }
    }
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

function main() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const scriptDirPath = __dirname;
    const projectRoot = path.dirname(scriptDirPath); // Go up one level to project root
    const srcDirPath = path.join(projectRoot, SRC_FOLDER_NAME);
    const destDirPath = path.join(projectRoot, DEST_FOLDER_NAME);

    if (!fs.existsSync(srcDirPath)) {
        console.error(`Error: Source folder '${SRC_FOLDER_NAME}' not found at: ${srcDirPath}`);
        return;
    }

    // Ensure destination directory exists
    ensureDirectoryExists(destDirPath);

    console.log(`Copying files from ${srcDirPath} to ${destDirPath}`);

    const ig = readGitignore(projectRoot); // Gitignore from project root
    copyFilesToDestination(srcDirPath, destDirPath, srcDirPath, ig);

    console.log("Finished copying and renaming files.");
}

main();