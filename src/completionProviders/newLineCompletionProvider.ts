import * as vscode from "vscode";
import { HYDRA_KEYWORDS } from "../constants";
import { getCurrentBlock } from "../utils/documentUtils";

export class NewLineCompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[] | undefined> {
    const currentBlock = getCurrentBlock(document, position);
    const existingKeys = new Set(Object.keys(currentBlock || {}));
    const availableKeys = [
      HYDRA_KEYWORDS.TARGET,
      HYDRA_KEYWORDS.RECURSIVE,
      HYDRA_KEYWORDS.CONVERT,
    ].filter(keyword => !existingKeys.has(keyword));
    return availableKeys.map(keyword => {
      const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
      item.insertText = `${keyword}: `;
      item.command = { command: "editor.action.triggerSuggest", title: "Trigger Suggest" };
      item.keepWhitespace = true;
      item.preselect = true;
      return item;
    });
  }
}
