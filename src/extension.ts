import * as vscode from "vscode";
import { registerCommands } from "./commands";
import { PythonPathCompletionProvider } from "./completionProviders/pythonPathCompletion";
import { clearDiagnostics, initDiagnostics } from "./utils/diagnostics";

export function activate(context: vscode.ExtensionContext) {
  registerCommands(context);
  initDiagnostics(context);

  // Python パスの補完プロバイダーを登録
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { scheme: "file", language: "yaml" },
      new PythonPathCompletionProvider(),
      ":",
      ".", // ドット入力時にも補完を発火
      " ", // スペースでも発火
    ),
  );
}

export function deactivate() {
  // 診断情報をクリア
  clearDiagnostics();
}
