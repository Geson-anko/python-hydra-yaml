import * as vscode from "vscode";
import { TargetCompletionProvider } from "./targetCompletion";

export function registerCompletionProviders(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { scheme: "file", language: "yaml" },
      new TargetCompletionProvider(),
      ":", // トリガー文字
      " ", // スペースでも発火
    ),
  );
}
