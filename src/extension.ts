import * as vscode from "vscode";
import { clearDiagnostics, initDiagnostics } from "./utils/diagnostics";

export function activate(context: vscode.ExtensionContext) {
  initDiagnostics(context);
}

export function deactivate() {
  // 診断情報をクリア
  clearDiagnostics();
}
