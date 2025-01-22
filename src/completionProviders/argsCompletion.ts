import * as vscode from "vscode";
import { HYDRA_KEYWORDS } from "../constants";

export class ArgsCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);

    if (linePrefix.includes(`${HYDRA_KEYWORDS.ARGS}:`)) {
      const item = new vscode.CompletionItem("\n  - ", vscode.CompletionItemKind.Snippet);
      item.insertText = new vscode.SnippetString("\n  - ${1}");
      item.command = {
        command: "editor.action.triggerSuggest",
        title: "Re-trigger completions",
      };
      return [item];
    }

    return undefined;
  }
}
