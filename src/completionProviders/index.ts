import * as vscode from "vscode";
import { PartialCompletionProvider } from "./partialCompletion";
import { TargetCompletionProvider } from "./targetCompletion";

export function registerCompletionProviders(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { scheme: "file", language: "yaml" },
      new TargetCompletionProvider(),
      ":",
      " ",
    ),
    vscode.languages.registerCompletionItemProvider(
      { scheme: "file", language: "yaml" },
      new PartialCompletionProvider(),
      ":",
      " ",
    ),
  );
}
