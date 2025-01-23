import * as vscode from "vscode";

export class ReferenceDefinitionProvider implements vscode.DefinitionProvider {
  provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.ProviderResult<vscode.Definition> {
    const line = document.lineAt(position.line).text;

    // カーソル位置が${...}の中にあるか確認
    const beforeCursor = line.substring(0, position.character);
    const afterCursor = line.substring(position.character);
    const lastDollar = beforeCursor.lastIndexOf("${");
    const nextBrace = afterCursor.indexOf("}");

    if (lastDollar === -1 || nextBrace === -1) {
      return undefined;
    }

    const refStart = lastDollar;
    const refEnd = position.character + nextBrace + 1;
    const fullRef = line.substring(refStart, refEnd);

    const refMatch = fullRef.match(/\${(\.+[^}]+)}/);
    if (!refMatch) {
      return undefined;
    }

    const refPath = refMatch[1];
    const dotCount = (refPath.match(/^\.*/) || [""])[0].length;
    const targetPath = refPath.slice(dotCount);

    return this.findDefinitionLocation(document, position.line, dotCount, targetPath);
  }

  private findDefinitionLocation(
    document: vscode.TextDocument,
    currentLine: number,
    dotCount: number,
    targetPath: string,
  ): vscode.Location | undefined {
    const pathParts = targetPath.split(".");
    let lineStack: number[] = [];

    for (let searchLine = 0; searchLine < document.lineCount; searchLine++) {
      const line = document.lineAt(searchLine).text;
      const lineContent = line.trim();
      const currentPart = pathParts[lineStack.length];

      if (currentPart === undefined) break;

      if (lineContent.startsWith(`${currentPart}:`)) {
        lineStack.push(searchLine);
      } else if (lineContent.startsWith("- ") && currentPart === String(lineStack.length)) {
        lineStack.push(searchLine);
      }

      if (lineStack.length === pathParts.length) {
        const lastLine = lineStack[lineStack.length - 1];
        const targetLine = document.lineAt(lastLine);
        const keyMatch = targetLine.text.match(/^[\s-]*([^:]+):/);
        const keyStart = keyMatch ? targetLine.text.indexOf(keyMatch[1]) : 0;

        return new vscode.Location(
          document.uri,
          new vscode.Position(lastLine, keyStart),
        );
      }
    }

    return undefined;
  }
}
