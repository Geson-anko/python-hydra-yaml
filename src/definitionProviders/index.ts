import * as vscode from "vscode";
import { ReferenceDefinitionProvider } from "./referenceDefinition";

export function registerDefinitionProviders(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      { scheme: "file", language: "yaml" },
      new ReferenceDefinitionProvider(),
    ),
  );
}
