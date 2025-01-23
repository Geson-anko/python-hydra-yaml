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

    const currentPath = this.getCurrentPath(document, position.line);
    const parsed = yaml.parse(document.getText());

    return this.findLocationInYaml(document, parsed, currentPath, dotCount, targetPath);
  }

  private getCurrentPath(document: vscode.TextDocument, lineNumber: number): string[] {
    const path: string[] = [];
    let currentIndent = -1;

    for (let i = 0; i <= lineNumber; i++) {
      const line = document.lineAt(i).text;
      const match = line.match(/^(\s*)([\w-]+):/);
      if (!match) continue;

      const [, indent, key] = match;
      const indentLevel = indent.length;

      if (currentIndent === -1 || indentLevel === 0) {
        path.length = 0;
        path.push(key);
        currentIndent = indentLevel;
      } else if (indentLevel > currentIndent) {
        path.push(key);
        currentIndent = indentLevel;
      } else if (indentLevel === currentIndent) {
        path.pop();
        path.push(key);
      } else {
        while (path.length > 0 && indentLevel < currentIndent) {
          path.pop();
          currentIndent -= 2;
        }
        path.push(key);
        currentIndent = indentLevel;
      }
    }
    return path;
  }

  private findLocationInYaml(
    document: vscode.TextDocument,
    yamlObj: any,
    currentPath: string[],
    dotCount: number,
    targetPath: string,
  ): vscode.Location | undefined {
    // カレントパスから必要な分だけ上に移動
    let resolvedPath = [...currentPath];
    resolvedPath.pop(); // 現在のキー名を除去
    for (let i = 1; i < dotCount; i++) {
      resolvedPath.pop();
    }

    // ターゲットパスが存在する場合は追加
    if (targetPath) {
      resolvedPath.push(...targetPath.split("."));
    }

    // パスに従ってYAMLをトラバース
    let target = yamlObj;
    let lineNumber = 0;

    for (const segment of resolvedPath) {
      if (!target || !(segment in target)) return undefined;

      // オブジェクトのキーを探す
      for (let i = lineNumber; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;
        if (line.trim().startsWith(`${segment}:`)) {
          lineNumber = i;
          break;
        }
      }

      target = target[segment];
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
