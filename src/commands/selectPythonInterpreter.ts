// src/commands/selectPythonInterpreter.ts
import * as vscode from 'vscode';
import { PythonExtension } from '@vscode/python-extension';
import { updateSettings } from '../utils/settings';
import { validatePythonInterpreter } from '../utils/pythonUtils';
import type { Environment, EnvironmentPath } from '@vscode/python-extension';

const CUSTOM_PATH_ITEM = '$(add) Enter custom path...';

export async function selectPythonInterpreter() {
    try {
        // Python extension APIの取得
        const pythonApi = await PythonExtension.api();
        const environments = pythonApi.environments;
        
        // 現在のアクティブ環境を取得
        const currentEnv = environments.getActiveEnvironmentPath();
        const envs = environments.known;
        
        // QuickPickのアイテムを作成
        const quickPickItems = [
            ...envs.map(env => ({
                label: getPythonDisplayName(env),
                description: env.path,
                picked: currentEnv?.path === env.path
            })),
            { 
                label: CUSTOM_PATH_ITEM,
                description: '' // description propertyを追加
            }
        ];

        // ユーザーに環境を選択させる
        const selected = await vscode.window.showQuickPick(
            quickPickItems,
            {
                placeHolder: 'Select Python environment or enter custom path',
                ignoreFocusOut: true
            }
        );

        if (!selected) {
            return;
        }

        let selectedPath: string;
        
        if (selected.label === CUSTOM_PATH_ITEM) {
            // カスタムパスの入力を受け付ける
            const customPath = await vscode.window.showInputBox({
                prompt: 'Enter Python interpreter path',
                placeHolder: '/usr/local/bin/python3',
                ignoreFocusOut: true,
                validateInput: async (value) => {
                    if (!value) {
                        return 'Path cannot be empty';
                    }
                    return null;
                }
            });

            if (!customPath) {
                return;
            }

            selectedPath = customPath;
        } else {
            selectedPath = selected.description;
        }

        // 選択されたインタープリターの検証
        vscode.window.showInformationMessage('Validating Python environment...');
        const validationResult = await validatePythonInterpreter(selectedPath);
        
        if (!validationResult.isValid) {
            vscode.window.showErrorMessage(validationResult.error || 'Invalid Python interpreter');
            return;
        }

        // Python拡張機能のアクティブ環境を更新
        await environments.updateActiveEnvironmentPath(selectedPath);

        // 設定を更新
        await updateSettings('hydra.pythonPath', selectedPath);
        vscode.window.showInformationMessage(`Python environment updated to: ${selectedPath}`);

        // 環境の変更を監視するイベントリスナーを設定
        const disposable = environments.onDidChangeActiveEnvironmentPath((e: EnvironmentPath) => {
            console.log(`Active environment changed to: ${e.path}`);
        });
        
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to update Python environment: ${error}`);
    }
}

// 環境の表示名を生成するヘルパー関数
function getPythonDisplayName(env: Environment): string {
    const version = env.version?.major ? `Python ${env.version.major}.${env.version.minor}` : 'Python';
    const location = env.path.split('/').slice(-2).join('/');
    return `${version} (${location})`;
}