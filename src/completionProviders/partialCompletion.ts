import * as vscode from "vscode";
import { HYDRA_KEYWORDS } from "../constants";

export class PartialCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.substr(0, position.character);

    if (linePrefix.includes(`${HYDRA_KEYWORDS.PARTIAL}:`)) {
      const items = [true, false].map(value => {
        const item = new vscode.CompletionItem(
          value.toString(),
          vscode.CompletionItemKind.Value,
        );
        item.documentation = new vscode.MarkdownString(
          value
            ? "Partially instantiate the target using functools.partial"
            : "Fully instantiate the target",
        );
        // trueを優先順位高く設定
        item.sortText = value ? "0" : "1";
        return item;
      });
      return items;
    }

    return undefined;
  }
}
