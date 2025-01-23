import * as vscode from "vscode";
import { HYDRA_KEYWORDS } from "../constants";
import { getPythonObjectLocation } from "../utils/pythonUtils";

export class TargetDefinitionProvider implements vscode.DefinitionProvider {
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Definition | undefined> {
    const line = document.lineAt(position.line).text;
    if (!line.includes(HYDRA_KEYWORDS.TARGET) && !line.match(/\bpath:\s*/)) {
      return undefined;
    }

    const importPath = line.split(":")[1]?.trim();
    if (!importPath) return undefined;

    const location = await getPythonObjectLocation(importPath);
    if (!location) return undefined;

    return new vscode.Location(
      vscode.Uri.file(location.filePath),
      new vscode.Position(location.lineNumber - 1, 0),
    );
  }
}
