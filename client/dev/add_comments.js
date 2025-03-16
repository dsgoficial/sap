import fs from 'fs';
import path from 'path';
import ignore from 'ignore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define the source folder name
const SRC_FOLDER_NAME = 'src';

// Lista de pastas para ignorar (mantenha como antes)
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

// Function to process .ts and .tsx files and add comment
function processTsFiles(startDir, currentDir, ig) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const relativePath = path.relative(startDir, fullPath);

        if (shouldIgnore(item, relativePath, ig)) continue;

        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            processTsFiles(startDir, fullPath, ig); // Recursive call for directories
        } else {
            if (item.endsWith('.ts') || item.endsWith('.tsx')) {
                // Process only .ts and .tsx files
                addCommentToFile(startDir, fullPath, relativePath);
            }
        }
    }
}

function addCommentToFile(srcDir, filePath, relativePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const comment = `// Path: ${relativePath}\n`;
        const lines = content.split('\n');
        let firstLine = lines[0];

        if (firstLine.startsWith('//')) {
            // First line is already a comment, replace it
            lines[0] = comment.trim(); // Replace the first line with the new comment, trim to remove extra newline
            content = lines.join('\n');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Comment updated in: ${relativePath}`);
        } else {
            // First line is not a comment, prepend the comment
            content = comment + content;
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Comment added to: ${relativePath}`);
        }
    } catch (error) {
        console.error(`Error processing file ${relativePath}: ${error.message}`);
    }
}

function main() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const scriptDirPath = __dirname;
    const projectRoot = path.dirname(scriptDirPath); // Go up one level to project root
    const srcDirPath = path.join(projectRoot, SRC_FOLDER_NAME);

    if (!fs.existsSync(srcDirPath)) {
        console.error(`Error: Folder '${SRC_FOLDER_NAME}' not found at: ${srcDirPath}`);
        return;
    }

    console.log(`Running script from src folder: ${srcDirPath}`);

    const ig = readGitignore(projectRoot); // Gitignore from project root
    processTsFiles(srcDirPath, srcDirPath, ig); // Start processing files from src folder

    console.log("Finished processing .ts and .tsx files.");
}

main();