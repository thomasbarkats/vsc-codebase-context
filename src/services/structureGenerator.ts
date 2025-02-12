import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively generates a tree-like structure of the directory
 * @param rootPath - Path to the directory to analyze
 * @param indent - Current level indentation (used for recursion)
 * @returns Formatted string representing the directory structure
 */
export async function generateStructure(rootPath: string, indent: string = ''): Promise<string> {
    let result = '';
    const items = fs.readdirSync(rootPath);

    // Sort directories first, then files alphabetically
    const sortedItems = items.sort((a, b) => {
        const aIsDir = fs.statSync(path.join(rootPath, a)).isDirectory();
        const bIsDir = fs.statSync(path.join(rootPath, b)).isDirectory();
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
    });

    for (let i = 0; i < sortedItems.length; i++) {
        const item = sortedItems[i];
        // Skip development-specific directories
        if (item === 'node_modules' || item === '.git') {
            continue;
        }

        const fullPath = path.join(rootPath, item);
        const stats = fs.statSync(fullPath);

        // Use different characters for last item to properly close the tree
        const isLast = i === sortedItems.length - 1;
        const prefix = isLast ? '└── ' : '├── ';
        const childIndent = isLast ? '    ' : '│   ';

        if (stats.isDirectory()) {
            result += `${indent}${prefix}${item}/\n`;
            // Recursively process subdirectories with proper indentation
            result += await generateStructure(fullPath, indent + childIndent);
        } else {
            result += `${indent}${prefix}${item}\n`;
        }
    }

    return result;
}
