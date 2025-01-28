import * as vscode from "vscode";
import { parse as yamlParse } from "yaml";

/**
 * Finds the range of a value for a given key in a text document.
 *
 * @param document - The VS Code text document to search in
 * @param key - The key to search for
 * @param value - The value associated with the key
 * @returns A VS Code Range object if found, null otherwise
 */
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

/**
 * Gets the YAML block at the current cursor position by analyzing indentation.
 *
 * @param document - The VS Code text document
 * @param position - The current cursor position
 * @returns Parsed YAML object of the current block, or empty object if parsing fails
 */
export function getCurrentBlock(document: vscode.TextDocument, position: vscode.Position): any {
  const lines: string[] = [];
  const currentLine = document.lineAt(position).text;
  const targetIndent = currentLine.match(/^(\s*)/)?.[1].length ?? 0;

  // Find the start of the current block by going up until we find a line with less indent
  let blockStart = position.line;
  for (let i = position.line - 1; i >= 0; i--) {
    const line = document.lineAt(i).text;
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;

    if (indent < targetIndent) {
      blockStart = i + 1; // Start from the first line with our target indent
      break;
    }
    if (indent === targetIndent && line.trim()) {
      blockStart = i; // Include lines at the same indent level
    }
  }

  // Collect all lines in the current block
  for (let i = blockStart; i < position.line; i++) {
    const line = document.lineAt(i).text;
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;

    if (indent >= targetIndent) {
      lines.push(line);
    }
  }

  try {
    return yamlParse(lines.join("\n")) || {};
  } catch {
    return {};
  }
}
