import * as vscode from "vscode";
import { ArgsCompletionProvider } from "./argsCompletion";
import { ConvertCompletionProvider } from "./convertCompletion";
import { PartialCompletionProvider } from "./partialCompletion";
import { RecursiveCompletionProvider } from "./recursiveCompletion";
import { TargetCompletionProvider } from "./targetCompletion";

/**
 * Registers all Hydra YAML completion providers with VS Code.
 *
 * @param context - VS Code extension context for registration
 */
export function registerCompletionProviders(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      { scheme: "file", language: "yaml" },
      new TargetCompletionProvider(),
      ":",
      " ",
      ".",
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
    vscode.languages.registerCompletionItemProvider(
      { scheme: "file", language: "yaml" },
      new ConvertCompletionProvider(),
      ":",
      " ",
    ),
  );
}
