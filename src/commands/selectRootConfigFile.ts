// src/commands/selectRootConfigFile.ts
import * as vscode from 'vscode';
import { updateSettings } from '../utils/settings';

export async function selectRootConfigFile() {
    const uris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false, 
        canSelectMany: false,
        filters: {
            'YAML files': ['yaml', 'yml']
        },
        openLabel: 'Select Hydra Root Config File'
    });

    if (uris && uris.length > 0) {
        try {
            await updateSettings('hydra.rootConfigFile', uris[0].fsPath);
            vscode.window.showInformationMessage('Root config file updated');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update root config file: ${error}`);
        }
    }
}