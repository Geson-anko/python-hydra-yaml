import { PythonExtension } from "@vscode/python-extension";
import * as vscode from "vscode";
import { getActivePythonPath } from "./pythonUtils";

let pythonEnvStatusBarItem: vscode.StatusBarItem;

/**
 * Creates and initializes the Python environment status bar item
 */
export function createPythonEnvStatusBar(context: vscode.ExtensionContext): vscode.StatusBarItem {
  pythonEnvStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  context.subscriptions.push(pythonEnvStatusBarItem);
  return pythonEnvStatusBarItem;
}

/**
 * Updates the status bar item with the current Python environment name
 */
export function updatePythonEnvStatus(pythonPath: string) {
  const envName = extractEnvName(pythonPath);
  pythonEnvStatusBarItem.text = `$(python) ${envName}`;
  pythonEnvStatusBarItem.tooltip = `Python Path: ${pythonPath}`;
  pythonEnvStatusBarItem.command = "python.setInterpreter";
  pythonEnvStatusBarItem.show();
}

/**
 * Registers event listener for Python environment changes
 */
export async function registerEnvChangeListener(context: vscode.ExtensionContext) {
  try {
    const pythonApi = await PythonExtension.api();
    context.subscriptions.push(
      pythonApi.environments.onDidChangeActiveEnvironmentPath(async (e) => {
        const newPath = await getActivePythonPath();
        if (newPath) {
          updatePythonEnvStatus(newPath);
        }
      }),
    );
  } catch (error) {
    console.error("Failed to register environment change listener:", error);
  }
}

/**
 * Extracts environment name from Python path
 */
function extractEnvName(pythonPath: string): string {
  // Windowsのパスも考慮して、/と\の両方で分割
  const segments = pythonPath.split(/[/\\]/);
  return segments.find(segment =>
    segment === "venv"
    || segment.includes("conda")
    || segment.startsWith(".")
  ) || "system";
}

/**
 * Disposes the status bar item
 */
export function disposePythonEnvStatusBar() {
  if (pythonEnvStatusBarItem) {
    pythonEnvStatusBarItem.dispose();
  }
}
