import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Activates the extension and registers the folder structure copy command
 */
export function activate(context: vscode.ExtensionContext) {
  // Register command that will be invoked when user right-clicks a folder
  let disposable = vscode.commands.registerCommand('folder-structure.copyStructure', async (uri: vscode.Uri) => {
    if (!uri) {
      vscode.window.showErrorMessage('Please right-click on a folder to copy its structure.');
      return;
    }

    try {
      // Include the root folder name in the output
      const rootName = path.basename(uri.fsPath);
      const structure = `${rootName}/\n${await generateStructure(uri.fsPath)}`;
      await vscode.env.clipboard.writeText(structure);
      vscode.window.showInformationMessage('Folder structure copied to clipboard!');
    } catch (error) {
      vscode.window.showErrorMessage('Error copying folder structure: ' + error);
    }
  });

  context.subscriptions.push(disposable);
}

/**
 * Recursively generates a tree-like structure of the directory
 * @param rootPath - Path to the directory to analyze
 * @param indent - Current level indentation (used for recursion)
 * @returns Formatted string representing the directory structure
 */
async function generateStructure(rootPath: string, indent: string = ''): Promise<string> {
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

export function deactivate() { }