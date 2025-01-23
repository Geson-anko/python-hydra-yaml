import * as vscode from "vscode";
import { ReferenceDefinitionProvider } from "./referenceDefinition";
import { TargetDefinitionProvider } from "./targetDefinition";

export function registerDefinitionProviders(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      { scheme: "file", language: "yaml" },
      new ReferenceDefinitionProvider(),
    ),
    vscode.languages.registerDefinitionProvider(
      { scheme: "file", language: "yaml" },
      new TargetDefinitionProvider(),
    ),
  );
}
