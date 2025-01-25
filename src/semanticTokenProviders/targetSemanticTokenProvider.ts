import * as vscode from "vscode";
import { HYDRA_KEYWORDS, HYDRA_UTILS_FUNCTIONS } from "../constants";

export class TargetSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
  private readonly legend = new vscode.SemanticTokensLegend(["importPath"]);

  getLegend(): vscode.SemanticTokensLegend {
    return this.legend;
  }

  async provideDocumentSemanticTokens(
    document: vscode.TextDocument,
  ): Promise<vscode.SemanticTokens> {
    const builder = new vscode.SemanticTokensBuilder(this.legend);
    const text = document.getText();
    const lines = text.split("\n");
    let currentTarget: string | null = null;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const targetMatch = line.match(new RegExp(`${HYDRA_KEYWORDS.TARGET}:\\s*([^\\s]+)`));
      const pathMatch = line.match(/path:\s*([^\s#]+)/);

      if (targetMatch) {
        const startChar = targetMatch.index! + HYDRA_KEYWORDS.TARGET.length + 2;
        const length = targetMatch[1].length;
        builder.push(lineIndex, startChar, length, 0);
        currentTarget = targetMatch[1];
      } else if (pathMatch && currentTarget && HYDRA_UTILS_FUNCTIONS.has(currentTarget)) {
        const startChar = pathMatch.index! + "path:".length + 1;
        const pathValue = pathMatch[1].trim();
        builder.push(lineIndex, startChar, pathValue.length, 0);
      }
    }

    return builder.build();
  }
}