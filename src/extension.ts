import * as vscode from "vscode";
import { registerCompletionProviders } from "./completionProviders";
import { registerDefinitionProviders } from "./definitionProviders";
import { clearDiagnostics, initDiagnostics } from "./diagnostics";
import { registerSemanticTokenProviders } from "./semanticTokenProviders";

export function activate(context: vscode.ExtensionContext) {
  initDiagnostics(context);
  registerCompletionProviders(context);
  registerDefinitionProviders(context);
  registerSemanticTokenProviders(context);
}

export function deactivate() {
  clearDiagnostics();
}
