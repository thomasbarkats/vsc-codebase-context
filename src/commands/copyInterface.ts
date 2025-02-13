import * as vscode from 'vscode';
import * as fs from 'fs';
import { ExtractorFactory } from '../extractorFactory';

export function registerCopyInterfaceCommand(context: vscode.ExtensionContext) {
  return vscode.commands.registerCommand('folder-structure.copyInterface', async (uri: vscode.Uri) => {
    if (!uri) {
      vscode.window.showErrorMessage('Please right-click on a file to copy its interface.');
      return;
    }

    try {
      const fileExtension = uri.fsPath.slice(uri.fsPath.lastIndexOf('.'));
      const extractor = await ExtractorFactory.getExtractor(fileExtension);

      if (!extractor) {
        vscode.window.showErrorMessage('This file type is not supported for interface extraction.');
        return;
      }

      const fileContent = fs.readFileSync(uri.fsPath, 'utf-8');
      const options: InterfaceExtractorOptions = {
        includePrivate: false,
        includeExportKeyword: false,
        includeDecorators: true
      };

      const interfaces = extractor.extractInterface(fileContent, options);
      if (interfaces) {
        await vscode.env.clipboard.writeText(interfaces);
        vscode.window.showInformationMessage('File interface copied to clipboard!');
      } else {
        vscode.window.showWarningMessage('No extractable interface for this file (check for classes)');
      }

    } catch (error) {
      vscode.window.showErrorMessage('Error extracting interface: ' + (error as Error).message);
    }
  });
}
