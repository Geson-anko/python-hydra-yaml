import * as vscode from 'vscode';
import { registerCommands } from './commands';
import { initDiagnostics, clearDiagnostics } from './utils/diagnostics';

export function activate(context: vscode.ExtensionContext) {
    registerCommands(context);
    initDiagnostics(context);
}

export function deactivate() {
    // 診断情報をクリア
    clearDiagnostics();
}