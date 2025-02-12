import * as vscode from 'vscode';
import * as path from 'path';
import { generateStructure } from '../services/structureGenerator';

export function registerCopyStructureCommand(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('folder-structure.copyStructure', async (uri: vscode.Uri) => {
    if (!uri) {
      vscode.window.showErrorMessage('Please right-click on a folder to copy its structure.');
      return;
    }

    try {
      const rootName = path.basename(uri.fsPath);
      const structure = `${rootName}/\n${await generateStructure(uri.fsPath)}`;
      await vscode.env.clipboard.writeText(structure);
      vscode.window.showInformationMessage('Folder structure copied to clipboard!');
    } catch (error) {
      vscode.window.showErrorMessage('Error copying folder structure: ' + error);
    }
  });
}
