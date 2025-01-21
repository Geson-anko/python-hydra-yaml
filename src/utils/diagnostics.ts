import * as vscode from "vscode";
import { parse as parseYaml } from "yaml";
import { DIAGNOSTIC_COLLECTION_NAME, HYDRA_KEYWORDS, HYDRA_UTILS_FUNCTIONS } from "../constants";
import { validatePythonImportPath } from "./pythonUtils";

let diagnosticCollection: vscode.DiagnosticCollection;

export function initDiagnostics(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_COLLECTION_NAME);
  context.subscriptions.push(
    diagnosticCollection,
    vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.languageId === "yaml") validateDocument(e.document);
    }),
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor?.document.languageId === "yaml") validateDocument(editor.document);
    }),
  );
}

async function validateDocument(document: vscode.TextDocument) {
  const diagnostics: vscode.Diagnostic[] = [];
  try {
    const yaml = parseYaml(document.getText());
    await validateNode(yaml, document, diagnostics);
  } catch (error) {
    // YAMLパースエラーは無視（VSCodeの組み込みYAML機能が処理）
  }
  diagnosticCollection.set(document.uri, diagnostics);
}

// src/utils/diagnostics.ts
async function validateNode(node: any, document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]) {
  if (!node || typeof node !== "object") return;

  if (HYDRA_KEYWORDS.TARGET in node) {
    const target = node[HYDRA_KEYWORDS.TARGET];
    const targetRange = findRange(document, `${HYDRA_KEYWORDS.TARGET}:`, target);
    if (targetRange) {
      const validationResult = await validatePythonImportPath(target);
      if (!validationResult.isValid && validationResult.error) {
        diagnostics.push(
          new vscode.Diagnostic(
            targetRange,
            validationResult.error,
            vscode.DiagnosticSeverity.Error,
          ),
        );
      }

      if (HYDRA_UTILS_FUNCTIONS.has(target)) {
        if (!node.path) {
          diagnostics.push(
            new vscode.Diagnostic(
              targetRange,
              `'path' field is required when using ${target}`,
              vscode.DiagnosticSeverity.Error,
            ),
          );
        } else {
          const pathRange = findRange(document, "path:", node.path);
          if (pathRange) {
            const pathValidation = await validatePythonImportPath(node.path);
            if (!pathValidation.isValid && pathValidation.error) {
              diagnostics.push(
                new vscode.Diagnostic(
                  pathRange,
                  pathValidation.error,
                  vscode.DiagnosticSeverity.Error,
                ),
              );
            }
          }
        }
      }
    }
  }

  for (const value of Object.values(node)) {
    if (typeof value === "object") {
      await validateNode(value, document, diagnostics);
    }
  }
}
function findRange(document: vscode.TextDocument, key: string, value: string): vscode.Range | null {
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

export function clearDiagnostics() {
  diagnosticCollection?.clear();
}
