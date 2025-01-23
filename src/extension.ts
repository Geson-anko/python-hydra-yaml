import * as vscode from "vscode";
import { registerCompletionProviders } from "./completionProviders";
import { clearDiagnostics, initDiagnostics } from "./diagnostics";

export function activate(context: vscode.ExtensionContext) {
  initDiagnostics(context);
  registerCompletionProviders(context);
}

export function deactivate() {
  clearDiagnostics();
}
