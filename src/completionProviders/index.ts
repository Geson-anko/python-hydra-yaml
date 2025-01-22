import * as vscode from "vscode";
import { ArgsCompletionProvider } from "./argsCompletion";
import { PartialCompletionProvider } from "./partialCompletion";
import { RecursiveCompletionProvider } from "./recursiveCompletion";
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
    vscode.languages.registerCompletionItemProvider(
      { scheme: "file", language: "yaml" },
      new ArgsCompletionProvider(),
      ":",
      " ",
    ),
    vscode.languages.registerCompletionItemProvider(
      { scheme: "file", language: "yaml" },
      new RecursiveCompletionProvider(),
      ":",
      " ",
    ),
  );
}
