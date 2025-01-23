import * as vscode from "vscode";

export function findRange(document: vscode.TextDocument, key: string, value: string): vscode.Range | null {
  const text = document.getText();
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(key)) {
      const valueStart = lines[i].indexOf(value);
      if (valueStart !== -1) {
        return new vscode.Range(
          new vscode.Position(i, valueStart),
          new vscode.Position(i, valueStart + value.length),
        );
      }
    }
  }
  return null;
}
