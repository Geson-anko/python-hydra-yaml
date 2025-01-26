import * as vscode from "vscode";
import { HydraSemanticTokensProvider } from "./hydraSemanticTokensProvider";

/**
 * Registers semantic token providers for the extension
 */
export function registerSemanticTokenProviders(context: vscode.ExtensionContext) {
  const selector = { language: "yaml", pattern: "**/*.yaml" };
  const targetProvider = new HydraSemanticTokensProvider();

  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      selector,
      targetProvider,
      targetProvider.getLegend(),
    ),
  );
}
