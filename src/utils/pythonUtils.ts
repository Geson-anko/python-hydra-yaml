import { PythonExtension } from "@vscode/python-extension";
import { exec } from "child_process";
import { promisify } from "util";
import * as vscode from "vscode";
import { PYTHON_SCRIPTS } from "../constants";

/**
 * Executes shell commands asynchronously using promisified exec.
 */
export const execAsync = promisify(exec);

/**
 * Gets the path of the currently active Python interpreter.
 *
 * @returns The path to the active Python interpreter, or undefined if not found
 */
export async function getActivePythonPath(): Promise<string | undefined> {
  try {
    const pythonApi = await PythonExtension.api();
    const activePath = pythonApi.environments.getActiveEnvironmentPath();
    return activePath?.path;
  } catch {
    return undefined;
  }
}

/**
 * Validates if a Python import path exists and can be imported.
 *
 * @param importPath - The fully qualified Python import path to validate
 * @returns Object containing validation result and error message if invalid
 */
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

/**
 * Checks if a Python import path refers to a callable object.
 *
 * @param importPath - The fully qualified Python import path to check
 * @returns True if the object is callable, false otherwise
 */
export async function isCallable(importPath: string): Promise<boolean> {
  const pythonPath = await getActivePythonPath();
  if (!pythonPath) return false;

  try {
    const script = PYTHON_SCRIPTS.CHECK_CALLABLE_TEMPLATE.replace(/%s/g, importPath);
    const { stdout } = await execAsync(`"${pythonPath}" -c "${script}"`);
    return !stdout.includes("Warning");
  } catch {
    return false;
  }
}

interface LocationResult {
  filePath: string;
  lineNumber: number;
}

export async function getPythonObjectLocation(importPath: string): Promise<LocationResult | undefined> {
  const pythonPath = await getActivePythonPath();
  if (!pythonPath) return undefined;

  try {
    const script = PYTHON_SCRIPTS.GET_OBJECT_LOCATION.replace("%s", importPath);
    const { stdout } = await execAsync(`"${pythonPath}" -c "${script}"`);
    if (!stdout) return undefined;

    return JSON.parse(stdout) as LocationResult;
  } catch (error) {
    console.error("Failed to get Python object location:", error);
    return undefined;
  }
}
