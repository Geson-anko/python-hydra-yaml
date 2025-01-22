import * as vscode from "vscode";
import { HYDRA_KEYWORDS, HYDRA_UTILS_FUNCTIONS } from "../constants";

export class TargetCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.substr(0, position.character);

    // _target_: の後の補完
    if (linePrefix.includes(`${HYDRA_KEYWORDS.TARGET}:`)) {
      return Array.from(HYDRA_UTILS_FUNCTIONS).map(func => {
        const item = new vscode.CompletionItem(func, vscode.CompletionItemKind.Function);
        item.insertText = new vscode.SnippetString(`${func}\npath: `);
        item.documentation = new vscode.MarkdownString(`Hydra utility function: ${func}`);
        return item;
      });
    }

    return undefined;
  }
}
