import * as vscode from "vscode";
import { parse as yamlParse } from "yaml";
import { HYDRA_KEYWORDS } from "../constants";
import { getInstantiationArgs } from "../utils/pythonUtils";

export class NewLineCompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[] | undefined> {
    const currentBlock = this.getCurrentBlock(document, position);

    if (currentBlock?._target_) {
      const args = await getInstantiationArgs(currentBlock._target_);
      if (!args) return undefined;

      const existingKeys = new Set(Object.keys(currentBlock || {}));
      const availableArgs = args.filter(arg => !existingKeys.has(arg));

      return availableArgs.map(arg => {
        const item = new vscode.CompletionItem(arg, vscode.CompletionItemKind.Property);
        item.insertText = `${arg}: `;
        item.command = { command: "editor.action.triggerSuggest", title: "Trigger Suggest" };
        // エンターでの補完を防ぐ
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
  private getCurrentBlock(document: vscode.TextDocument, position: vscode.Position): any {
    const currentLine = document.lineAt(position).text;
    const currentIndent = currentLine.match(/^(\s*)/)?.[1].length ?? 0;
    let blockStart = position.line;

    for (let i = position.line - 1; i >= 0; i--) {
      const line = document.lineAt(i).text;
      const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
      if (indent < currentIndent) {
        blockStart = i;
        break;
      }
    }

    try {
      const blockText = document.getText(new vscode.Range(blockStart, 0, position.line, 0));
      return yamlParse(blockText);
    } catch {
      return {};
    }
  }
}
