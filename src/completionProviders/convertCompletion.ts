import * as vscode from "vscode";
import { ConvertComletions, HYDRA_KEYWORDS } from "../constants";

export class ConvertCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);

    if (linePrefix.includes(`${HYDRA_KEYWORDS.CONVERT}:`)) {
      return Object.values(ConvertComletions).map(value => {
        const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.EnumMember);
        item.documentation = new vscode.MarkdownString(this.getDocumentation(value));
        return item;
      });
    }
    return undefined;
  }

  private getDocumentation(value: string): string {
    const docs: Record<typeof ConvertComletions[keyof typeof ConvertComletions], string> = {
      [ConvertComletions.NONE]: "Default behavior. Use OmegaConf containers",
      [ConvertComletions.PARTIAL]:
        "Convert OmegaConf containers to dict and list, except Structured Configs which remain as DictConfig instances",
      [ConvertComletions.OBJECT]:
        "Convert OmegaConf containers to dict and list, except Structured Configs which are converted to instances of the backing dataclass/attr class",
      [ConvertComletions.ALL]: "Convert everything to primitive containers",
    };
    return docs[value as keyof typeof docs];
  }
}
