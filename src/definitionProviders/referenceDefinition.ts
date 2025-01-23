import * as vscode from "vscode";
import * as yaml from "yaml";

export class ReferenceDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Definition> {
    const line = document.lineAt(position.line).text;
    const beforeCursor = line.substring(0, position.character);
    const afterCursor = line.substring(position.character);
    const lastDollar = beforeCursor.lastIndexOf("${");
    const nextBrace = afterCursor.indexOf("}");

    if (lastDollar === -1 || nextBrace === -1) return undefined;

    const refStart = lastDollar;
    const refEnd = position.character + nextBrace + 1;
    const fullRef = line.substring(refStart, refEnd);

    const refMatch = fullRef.match(/\${(\.+[^}]+)}/);
    if (!refMatch) return undefined;

    const refPath = refMatch[1];
    const dotCount = (refPath.match(/^\.*/) || [""])[0].length;
    const targetPath = refPath.slice(dotCount);

    const parsed = yaml.parse(document.getText());
    return this.findLocationInYaml(document, parsed, targetPath.split("."));
  }

  private findLocationInYaml(
    document: vscode.TextDocument,
    yamlObj: any,
    pathParts: string[],
  ): vscode.Location | undefined {
    let current = yamlObj;
    let lineNumber = 0;

    for (const part of pathParts) {
      if (Array.isArray(current)) {
        const index = parseInt(part);
        if (!isNaN(index) && current[index] !== undefined) {
          // 配列要素を探す
          let arrayStart = -1;
          let elementCount = 0;

          for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text;
            if (line.trim().startsWith("- ")) {
              if (arrayStart === -1) arrayStart = i;
              if (elementCount === index) {
                lineNumber = i;
                break;
              }
              elementCount++;
            }
          }
          current = current[index];
          continue;
        }
      }

      if (!current || !(part in current)) return undefined;

      // オブジェクトのキーを探す
      for (let i = lineNumber; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;
        if (line.trim().startsWith(`${part}:`)) {
          lineNumber = i;
          break;
        }
      }

      current = current[part];
    }

    const targetLine = document.lineAt(lineNumber);
    const keyMatch = targetLine.text.match(/^[\s-]*([^:]+):/);
    const keyStart = keyMatch ? targetLine.text.indexOf(keyMatch[1]) : 0;

    return new vscode.Location(
      document.uri,
      new vscode.Position(lineNumber, keyStart),
    );
  }
}
