import * as vscode from "vscode";
import { parse as yamlParse } from "yaml";
import { HYDRA_KEYWORDS, HYDRA_UTILS_FUNCTIONS, PYTHON_SCRIPTS } from "../constants";
import { getCurrentBlock } from "../utils/documentUtils";
import { execAsync, getActivePythonPath, getInstantiationArgs } from "../utils/pythonUtils";

export class TargetCompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[] | undefined> {
    const linePrefix = document.lineAt(position).text.slice(0, position.character);
    const currentBlock = getCurrentBlock(document, position);

    // Handle _target_ arguments completion
    if (currentBlock?._target_) {
      const args = await getInstantiationArgs(currentBlock._target_);
      if (!args) return undefined;

      const existingKeys = new Set(Object.keys(currentBlock || {}));
      const availableArgs = args.filter(arg => !existingKeys.has(arg));

      return availableArgs.map(arg => {
        const item = new vscode.CompletionItem(arg, vscode.CompletionItemKind.Property);
        item.insertText = `${arg}: `;
        item.command = { command: "editor.action.triggerSuggest", title: "Trigger Suggest" };
        item.preselect = true;
        return item;
      });
    }

    // Handle path completion
    if (linePrefix.includes("path:")) {
      try {
        const text = document.getText();
        const parsed = yamlParse(text);
        const currentObject = this.findCurrentObject(parsed, document, position);

        if (currentObject?._target_ && HYDRA_UTILS_FUNCTIONS.has(currentObject._target_)) {
          return await this.getPythonCompletions(linePrefix);
        }
      } catch (error) {
        return undefined;
      }
      return undefined;
    }

    // Handle _target_ completion
    if (!linePrefix.includes(`${HYDRA_KEYWORDS.TARGET}:`)) {
      return undefined;
    }

    const items = [HYDRA_KEYWORDS.ARGS, HYDRA_KEYWORDS.PARTIAL].map(func => {
      const item = new vscode.CompletionItem(func, vscode.CompletionItemKind.Function);
      item.insertText = new vscode.SnippetString(`${func}\npath: `);
      item.documentation = new vscode.MarkdownString(`Hydra utility function: ${func}`);
      return item;
    });

    return await this.getPythonCompletions(linePrefix, items);
  }

  private findCurrentObject(yaml: any, document: vscode.TextDocument, position: vscode.Position): any {
    const currentBlock = getCurrentBlock(document, position);
    return currentBlock || null;
  }

  private async getPythonCompletions(
    linePrefix: string,
    initialItems: vscode.CompletionItem[] = [],
  ): Promise<vscode.CompletionItem[] | undefined> {
    const pythonPath = await getActivePythonPath();
    if (!pythonPath) {
      return initialItems;
    }

    try {
      const match = linePrefix.match(/[A-Za-z0-9_.]*$/);
      const currentInput = match ? match[0] : "";
      const parts = currentInput.split(".");

      if (parts.length <= 1) {
        const { stdout } = await execAsync(`"${pythonPath}" -c "${PYTHON_SCRIPTS.LIST_TOP_LEVEL_PACKAGES}"`);
        let packages = stdout.split("\n").filter(Boolean);
        packages.unshift("builtins"); // builtin関数の追加
        return [
          ...initialItems,
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
      return initialItems;
    }
  }
}
