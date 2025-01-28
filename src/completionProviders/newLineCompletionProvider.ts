import * as vscode from "vscode";
import { HYDRA_KEYWORDS } from "../constants";
import { getCurrentBlock } from "../utils/documentUtils";
import { getInstantiationArgs } from "../utils/pythonUtils";

export class NewLineCompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[] | undefined> {
    const currentBlock = getCurrentBlock(document, position);

    if (currentBlock?._target_) {
      const args = await getInstantiationArgs(currentBlock._target_);
      if (!args) return undefined;

      const existingKeys = new Set(Object.keys(currentBlock || {}));
      const availableArgs = args.filter(arg => !existingKeys.has(arg));

      return availableArgs.map(arg => {
        const item = new vscode.CompletionItem(arg, vscode.CompletionItemKind.Property);
        item.insertText = `${arg}: `;
        item.command = { command: "editor.action.triggerSuggest", title: "Trigger Suggest" };
        item.keepWhitespace = true;
        item.preselect = true;
        return item;
      });
    }

    return [
      HYDRA_KEYWORDS.TARGET,
      HYDRA_KEYWORDS.RECURSIVE,
      HYDRA_KEYWORDS.CONVERT,
    ].map(keyword => {
      const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
      item.insertText = `${keyword}: `;
      item.command = { command: "editor.action.triggerSuggest", title: "Trigger Suggest" };
      item.keepWhitespace = true;
      item.preselect = true;
      return item;
    });
  }
}
