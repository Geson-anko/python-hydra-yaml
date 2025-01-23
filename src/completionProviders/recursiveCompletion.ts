import * as vscode from "vscode";
import { HYDRA_KEYWORDS } from "../constants";

/**
 * Provides autocompletion for Hydra _recursive_ values in YAML files.
 * Suggests true/false options with documentation about recursive instantiation.
 */
export class RecursiveCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);

    if (linePrefix.includes(`${HYDRA_KEYWORDS.RECURSIVE}:`)) {
      return [false, true].map(value => {
        const item = new vscode.CompletionItem(
          value.toString(),
          vscode.CompletionItemKind.Value,
        );
        item.documentation = new vscode.MarkdownString(
          value
            ? "Recursively instantiate all nested objects"
            : "Only instantiate the top-level object",
        );
        item.sortText = value ? "1" : "0"; // falseを先に表示
        return item;
      });
    }

    return undefined;
  }
}
