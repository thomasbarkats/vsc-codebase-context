import * as vscode from 'vscode';
import * as fs from 'fs';
import { InterfaceExtractorService } from "../services/interfaceExtractor";


export function registerCopyInterfaceCommand(context: vscode.ExtensionContext) {
  const extractorService = new InterfaceExtractorService();

  return vscode.commands.registerCommand('folder-structure.copyInterface', async (uri: vscode.Uri) => {
    if (!uri) {
      vscode.window.showErrorMessage('Please right-click on a file to copy its interface.');
      return;
    }

    try {
      const fileContent = fs.readFileSync(uri.fsPath, 'utf-8');
      const options: InterfaceExtractorOptions = {
        includePrivate: false,
        includeExportKeyword: false,
        includeDecorators: true
      };

      const interfaces = extractorService.extractInterface(uri.fsPath, fileContent, options);
      await vscode.env.clipboard.writeText(interfaces);
      vscode.window.showInformationMessage('File interface copied to clipboard!');

    } catch (error) {
      if ((error as Error)?.message === 'No extractor found for this file type') {
        vscode.window.showErrorMessage('This file type is not supported for interface extraction.');
      } else {
        vscode.window.showErrorMessage('Error extracting interface: ' + error);
      }
    }
  });
}
