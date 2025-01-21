import * as vscode from "vscode";
import { HYDRA_KEYWORDS, HYDRA_SETTINGS, PYTHON_SCRIPTS } from "../constants";
import { execAsync } from "../utils/pythonUtils";

export class PythonPathCompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[] | undefined> {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);
    console.log(1);
    // _target_: の直後のみ補完を提供
    if (!linePrefix.endsWith(`${HYDRA_KEYWORDS.TARGET}: `)) {
      return undefined;
    }
    console.log(2);

    const pythonPath = vscode.workspace.getConfiguration().get<string>(HYDRA_SETTINGS.PYTHON_PATH);
    if (!pythonPath) {
      return undefined;
    }
    console.log(3);

    try {
      const { stdout } = await execAsync(`"${pythonPath}" -c "${PYTHON_SCRIPTS.LIST_TOP_LEVEL_PACKAGES}"`);
      console.log(stdout);
      return stdout.split("\n")
        .filter(name => name.trim())
        .map(name => {
          const item = new vscode.CompletionItem(name);
          item.kind = vscode.CompletionItemKind.Module;
          console.log(item);
          return item;
        });
    } catch (error) {
      console.error("Failed to get python completions:", error);
      return undefined;
    }
  }
}
