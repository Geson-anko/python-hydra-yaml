import * as vscode from "vscode";
import { HYDRA_KEYWORDS, HYDRA_UTILS_FUNCTIONS, PYTHON_SCRIPTS } from "../constants";
import { execAsync, getActivePythonPath } from "../utils/pythonUtils";

export class TargetCompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[] | undefined> {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);

    if (!linePrefix.includes(`${HYDRA_KEYWORDS.TARGET}:`)) {
      return undefined;
    }

    const items = Array.from(HYDRA_UTILS_FUNCTIONS).map(func => {
      const item = new vscode.CompletionItem(func, vscode.CompletionItemKind.Function);
      item.insertText = new vscode.SnippetString(`${func}\npath: `);
      item.documentation = new vscode.MarkdownString(`Hydra utility function: ${func}`);
      return item;
    });

    const pythonPath = await getActivePythonPath();
    if (!pythonPath) {
      return items;
    }

    try {
      const match = linePrefix.match(/[A-Za-z0-9_.]*$/);
      const currentInput = match ? match[0] : "";
      const parts = currentInput.split(".");

      if (parts.length <= 1) {
        const { stdout } = await execAsync(`"${pythonPath}" -c "${PYTHON_SCRIPTS.LIST_TOP_LEVEL_PACKAGES}"`);
        const packages = stdout.split("\n").filter(Boolean);

        return [
          ...items,
          ...packages.map(pkg => {
            const item = new vscode.CompletionItem(pkg, vscode.CompletionItemKind.Module);
            item.insertText = pkg;
            item.commitCharacters = ["."];
            return item;
          }),
        ];
      } else {
        const modulePath = parts.slice(0, -1).join(".");
        const script = PYTHON_SCRIPTS.LIST_MODULE_ATTRIBUTES.replace("${modulePath}", modulePath);
        const { stdout } = await execAsync(`"${pythonPath}" -c "${script}"`);
        const attributes = stdout.split("\n").filter(Boolean);

        return attributes.map(attr => {
          const item = new vscode.CompletionItem(attr, vscode.CompletionItemKind.Property);
          item.insertText = attr;
          item.commitCharacters = ["."];
          return item;
        });
      }
    } catch (error) {
      console.error("Failed to get Python completions:", error);
      return items;
    }
  }
}
