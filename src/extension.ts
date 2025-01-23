import * as vscode from "vscode";
import { registerCompletionProviders } from "./completionProviders";
import { registerDefinitionProviders } from "./definitionProviders";
import { clearDiagnostics, initDiagnostics } from "./diagnostics";

export function activate(context: vscode.ExtensionContext) {
  initDiagnostics(context);
  registerCompletionProviders(context);
  registerDefinitionProviders(context);
}

export function deactivate() {
  clearDiagnostics();
}
