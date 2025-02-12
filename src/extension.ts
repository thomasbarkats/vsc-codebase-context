import * as vscode from 'vscode';
import { registerCopyStructureCommand } from './commands/copyStructure';
import { registerCopyInterfaceCommand } from './commands/copyInterface';

/**
* Activates the extension and registers all available commands
*/
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(registerCopyStructureCommand(context));
  context.subscriptions.push(registerCopyInterfaceCommand(context));
}

export function deactivate() { }
