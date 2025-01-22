// src/utils/pythonUtils.ts
import { PythonExtension } from "@vscode/python-extension";
import { exec } from "child_process";
import { promisify } from "util";
import { PYTHON_SCRIPTS } from "../constants";

export const execAsync = promisify(exec);

export async function getActivePythonPath(): Promise<string | undefined> {
  try {
    const pythonApi = await PythonExtension.api();
    const activePath = pythonApi.environments.getActiveEnvironmentPath();
    return activePath?.path;
  } catch {
    return undefined;
  }
}

export async function validatePythonImportPath(importPath: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  try {
    if (!importPath.includes(".")) {
      return {
        isValid: false,
        error: "Invalid import path: must be a fully qualified path (e.g. package.module.object)",
      };
    }

    const pythonPath = await getActivePythonPath();
    if (!pythonPath) {
      return {
        isValid: false,
        error: "No Python interpreter available. Please configure Python extension.",
      };
    }

    const checkImport = PYTHON_SCRIPTS.IMPORT_CHECK_TEMPLATE.replace(/%s/g, importPath);
    await execAsync(`"${pythonPath}" -c "${checkImport}"`);

    return { isValid: true };
  } catch (error: any) {
    const errorOutput = error.stderr || error.stdout || error.message || "Unknown error occurred";
    const lastLine = errorOutput.trim().split("\n").pop() || "Unknown error occurred";

    return {
      isValid: false,
      error: lastLine,
    };
  }
}
