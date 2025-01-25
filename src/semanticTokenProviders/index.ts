import * as vscode from "vscode";
import { TargetSemanticTokensProvider } from "./targetTokenProvider";

/**
 * Registers semantic token providers for the extension
 */
export function registerSemanticTokenProviders(context: vscode.ExtensionContext) {
  const selector = { language: "yaml", pattern: "**/*.yaml" };
  const targetProvider = new TargetSemanticTokensProvider();

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      selector,
      targetProvider,
      targetProvider.getLegend(),
    ),
  );
}
