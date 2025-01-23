import * as vscode from "vscode";

export async function validateRelativePaths(yaml: any, document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
  const diagnostics: vscode.Diagnostic[] = [];

  function traverseObject(obj: any, path: string[] = [], parentObj: any = yaml) {
    if (!obj || typeof obj !== "object") return;

    // 文字列値内の${...}参照を検索
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "string") {
        const matches = value.match(/\${(\.+[^}]+)}/g);
        if (matches) {
          matches.forEach(match => {
            const relativePath = match.slice(2, -1); // ${...}の中身を取得
            const dotCount = relativePath.match(/^\.+/)?.[0].length ?? 0;

            // 現在の階層から相対パスを解決
            let currentPath = [...path];
            for (let i = 0; i < dotCount - 1; i++) {
              currentPath.pop();
            }

            const targetPath = relativePath.slice(dotCount).split(".");
            let target = parentObj;
            let valid = true;

            // パスを辿って値を検証
            for (let i = 0; i < targetPath.length; i++) {
              const segment = targetPath[i];
              if (Array.isArray(target)) {
                const index = parseInt(segment);
                if (isNaN(index) || index >= target.length) {
                  valid = false;
                  break;
                }
                target = target[index];
              } else if (target && typeof target === "object") {
                if (!(segment in target)) {
                  valid = false;
                  break;
                }
                target = target[segment];
              } else {
                valid = false;
                break;
              }
            }

            // 診断結果を追加
            const range = findReferenceRange(document, match);
            if (range) {
              if (!valid && dotCount > currentPath.length + 1) {
                diagnostics.push(
                  new vscode.Diagnostic(
                    range,
                    "Reference exceeds file root level",
                    vscode.DiagnosticSeverity.Warning,
                  ),
                );
              } else if (!valid) {
                diagnostics.push(
                  new vscode.Diagnostic(
                    range,
                    "Referenced path not found",
                    vscode.DiagnosticSeverity.Error,
                  ),
                );
              }
            }
          });
        }
      } else if (typeof value === "object") {
        traverseObject(value, [...path, key], obj);
      }
    });
  }

  traverseObject(yaml);
  return diagnostics;
}

function findReferenceRange(document: vscode.TextDocument, reference: string): vscode.Range | null {
  const text = document.getText();
  const start = text.indexOf(reference);
  if (start === -1) return null;

  const pos = document.positionAt(start);
  return new vscode.Range(pos, document.positionAt(start + reference.length));
}
