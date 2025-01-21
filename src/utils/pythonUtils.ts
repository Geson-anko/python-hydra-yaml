// src/utils/pythonUtils.ts
import { exec, ExecException } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';

const execAsync = promisify(exec);

interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export async function validatePythonInterpreter(path: string): Promise<ValidationResult> {
    try {
        // Pythonバージョンの確認
        const { stdout: versionOutput } = await execAsync(`"${path}" --version`);
        if (!versionOutput.toLowerCase().includes('python')) {
            return {
                isValid: false,
                error: 'Not a valid Python interpreter'
            };
        }

        // Hydraのインストール確認
        const checkHydra = 'import hydra';
        await execAsync(`"${path}" -c "${checkHydra}"`);
        return { isValid: true };

    } catch (error: unknown) {
        // エラーの型を ExecException として扱う
        const execError = error as ExecException;
        
        if (execError.stderr?.includes('ModuleNotFoundError') || 
            execError.stderr?.includes('hydra-core')) {
            return {
                isValid: false,
                error: 'Hydra is not installed in this Python environment'
            };
        }

        return {
            isValid: false,
            error: `Invalid Python interpreter: ${execError.message}`
        };
    }
}


export async function validatePythonImportPath(importPath: string): Promise<ValidationResult> {
    const pythonPath = vscode.workspace.getConfiguration('hydra').get<string>('pythonPath');
    if (!pythonPath) {
        return {
            isValid: false,
            error: 'Python interpreter not configured. Please use "Select Python Interpreter" command.'
        };
    }

    try {
        if (!importPath.includes('.')) {
            return {
                isValid: false,
                error: 'Invalid import path: must be a fully qualified path (e.g. package.module.object)'
            };
        }
        // _target_ must be a fully qualified object path (module.submodule.object)
        const checkImport = `
import importlib

module_parts = '${importPath}'.rsplit('.', 1)
if len(module_parts) <= 1:
    raise ValueError(f'Invalid _target_ format: {importPath} - must be a fully qualified object path')

module_path, object_name = module_parts
module = importlib.import_module(module_path)
getattr(module, object_name)
`;
        await execAsync(`"${pythonPath}" -c "${checkImport}"`);
        return { isValid: true };
    } catch (error) {
        const execError = error as ExecException;
        const errorOutput = execError.stderr || execError.stdout || execError.message || 'Unknown error occurred';
        console.log(errorOutput);
        // エラーメッセージの最後の行を取得
        const lastLine = errorOutput.trim().split('\n').pop() || 'Unknown error occurred';
        
        return {
            isValid: false,
            error: lastLine
        };
    }
}
