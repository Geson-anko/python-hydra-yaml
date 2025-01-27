import * as vscode from "vscode";
import { registerCompletionProviders } from "./completionProviders";
import { registerDefinitionProviders } from "./definitionProviders";
import { clearDiagnostics, initDiagnostics } from "./diagnostics";
import { registerSemanticTokenProviders } from "./semanticTokensProviders";
import { getActivePythonPath, isHydraExists } from "./utils/pythonUtils";
import {
  createPythonEnvStatusBar,
  disposePythonEnvStatusBar,
  registerEnvChangeListener,
  updatePythonEnvStatus,
} from "./utils/statusBarUtils";

export async function activate(context: vscode.ExtensionContext) {
  const pythonPath = await getActivePythonPath();
  if (!pythonPath) {
    vscode.window.showInformationMessage(
      "Python interpreter is required for python-hydra-yaml extension. Please run 'Python: Select Interpreter' command.",
      "Select Interpreter",
    ).then(selection => {
      if (selection === "Select Interpreter") {
        vscode.commands.executeCommand("python.setInterpreter");
      }
    });
    return;
  }

  if (!await isHydraExists()) {
    vscode.window.showErrorMessage(
      "Hydra is required for this extension. Please install it using 'pip install hydra-core'",
    );
    return;
  }

  // ステータスバーの初期化
  createPythonEnvStatusBar(context);
  updatePythonEnvStatus(pythonPath);
  registerEnvChangeListener(context);

  initDiagnostics(context);
  registerCompletionProviders(context);
  registerDefinitionProviders(context);
  registerSemanticTokenProviders(context);
}

export function deactivate() {
  clearDiagnostics();
  disposePythonEnvStatusBar();
}
