import * as vscode from "vscode";
import { HYDRA_KEYWORDS, HYDRA_SETTINGS, PYTHON_SCRIPTS } from "../constants";
import { execAsync } from "../utils/pythonUtils";

export class PythonPathCompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[] | undefined> {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);

    // _target_: の後に続く空白文字で発火するように条件を変更
    if (!linePrefix.match(`${HYDRA_KEYWORDS.TARGET}:\\s*$`)) {
      return undefined;
    }

    const pythonPath = vscode.workspace.getConfiguration().get<string>(HYDRA_SETTINGS.PYTHON_PATH);
    if (!pythonPath) {
      return undefined;
    }

    try {
      const { stdout } = await execAsync(`"${pythonPath}" -c "${PYTHON_SCRIPTS.LIST_TOP_LEVEL_PACKAGES}"`);

      return stdout.split("\n")
        .filter(name => name.trim())
        .map(name => {
          const item = new vscode.CompletionItem(name);
          item.kind = vscode.CompletionItemKind.Module;
          return item;
        });
    } catch (error) {
      console.error("Failed to get python completions:", error);
      return undefined;
    }
  }
}
