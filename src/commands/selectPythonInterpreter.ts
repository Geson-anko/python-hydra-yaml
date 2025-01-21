// src/commands/selectPythonInterpreter.ts
import * as vscode from 'vscode';
import { updateSettings } from '../utils/settings';

export async function selectPythonInterpreter() {
    const path = await vscode.window.showInputBox({
        prompt: 'Enter Python interpreter path',
        placeHolder: '/usr/bin/python3'
    });

    if (path) {
        try {
            await updateSettings('hydra.pythonPath', path);
            vscode.window.showInformationMessage('Python interpreter path updated');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update Python interpreter path: ${error}`);
        }
    }
}