import * as vscode from "vscode";
import { HYDRA_KEYWORDS } from "../constants";
import { HYDRA_UTILS_FUNCTIONS } from "../constants";
import { findRange } from "../utils/documentUtils";
import { validatePythonImportPath } from "../utils/pythonUtils";

export async function validateImportPaths(yaml: any, document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
  const diagnostics: vscode.Diagnostic[] = [];

  async function validateNodeImports(node: any) {
    if (!node || typeof node !== "object") return;

    if (HYDRA_KEYWORDS.TARGET in node) {
      const targetValue = node[HYDRA_KEYWORDS.TARGET];
      const targetRange = findRange(document, HYDRA_KEYWORDS.TARGET, targetValue);

      if (targetRange) {
        if (HYDRA_UTILS_FUNCTIONS.has(targetValue)) {
          if (node.path) {
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
        } else {
          const result = await validatePythonImportPath(targetValue);
          if (!result.isValid && result.error) {
            diagnostics.push(
              new vscode.Diagnostic(
                targetRange,
                result.error,
                vscode.DiagnosticSeverity.Error,
              ),
            );
          }
        }
      }
    }

    for (const value of Object.values(node)) {
      if (typeof value === "object") {
        await validateNodeImports(value);
      }
    }
  }

  await validateNodeImports(yaml);
  return diagnostics;
}
