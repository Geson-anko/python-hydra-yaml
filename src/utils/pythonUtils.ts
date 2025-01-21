// src/utils/pythonUtils.ts
import { exec, ExecException } from 'child_process';
import { promisify } from 'util';

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