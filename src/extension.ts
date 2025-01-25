import * as vscode from "vscode";
import { registerCompletionProviders } from "./completionProviders";
import { registerDefinitionProviders } from "./definitionProviders";
import { clearDiagnostics, initDiagnostics } from "./diagnostics";
import { registerSemanticTokenProviders } from "./semanticTokenProviders";
import { getActivePythonPath } from "./utils/pythonUtils";

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

  initDiagnostics(context);
  registerCompletionProviders(context);
  registerDefinitionProviders(context);
  registerSemanticTokenProviders(context);
}

export function deactivate() {
  clearDiagnostics();
}
