import * as vscode from "vscode";
import { HYDRA_KEYWORDS, HYDRA_UTILS_FUNCTIONS } from "../constants";
import { findRange } from "../utils/documentUtils";
import { isCallable, validatePythonImportPath } from "../utils/pythonUtils";
import { isHydraReference } from "../utils/referenceUtils";

/**
 * Validates Hydra target configurations and Python import paths in YAML files.
 * Performs syntax validation, field validation, and Python import path verification.
 */
export async function validateTargets(yaml: any, document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
  const diagnostics: vscode.Diagnostic[] = [];

  async function validateNode(node: any) {
    if (!node || typeof node !== "object") return;

    if (HYDRA_KEYWORDS.TARGET in node) {
      const targetValue = node[HYDRA_KEYWORDS.TARGET];
      const targetRange = findRange(document, HYDRA_KEYWORDS.TARGET, targetValue);
      if (!targetRange) return;

      // Skip validation for Hydra references
      if (!isHydraReference(targetValue)) {
        // Syntax validation
        if (!isValidTargetSyntax(targetValue)) {
          diagnostics.push(
            new vscode.Diagnostic(
              targetRange,
              "Invalid _target_ format. Must be a fully qualified import path (e.g. 'package.module.class')",
              vscode.DiagnosticSeverity.Error,
            ),
          );
          return;
        }

        // Import path validation
        if (HYDRA_UTILS_FUNCTIONS.has(targetValue)) {
          if (!node.path) {
            diagnostics.push(
              new vscode.Diagnostic(
                targetRange,
                `'path' field is required when using ${targetValue}`,
                vscode.DiagnosticSeverity.Error,
              ),
            );
          } else if (!isHydraReference(node.path)) {
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
          const importValidation = await validatePythonImportPath(targetValue);
          if (!importValidation.isValid && importValidation.error) {
            diagnostics.push(
              new vscode.Diagnostic(
                targetRange,
                importValidation.error,
                vscode.DiagnosticSeverity.Error,
              ),
            );
          } else {
            const isCallableObj = await isCallable(targetValue);
            if (!isCallableObj) {
              diagnostics.push(
                new vscode.Diagnostic(
                  targetRange,
                  `Warning: '${targetValue}' is not callable`,
                  vscode.DiagnosticSeverity.Warning,
                ),
              );
            }
          }
        }

        // _partial_ validation
        if (HYDRA_KEYWORDS.PARTIAL in node) {
          const partialValue = node[HYDRA_KEYWORDS.PARTIAL];
          if (typeof partialValue !== "boolean") {
            const partialRange = findRange(document, HYDRA_KEYWORDS.PARTIAL, partialValue.toString());
            if (partialRange) {
              diagnostics.push(
                new vscode.Diagnostic(
                  partialRange,
                  "_partial_ must be a boolean value",
                  vscode.DiagnosticSeverity.Error,
                ),
              );
            }
          }
        }

        // _convert_ validation
        if (HYDRA_KEYWORDS.CONVERT in node) {
          const convertValue = node[HYDRA_KEYWORDS.CONVERT];
          if (!["none", "partial", "all", "object"].includes(convertValue)) {
            const convertRange = findRange(document, HYDRA_KEYWORDS.CONVERT, convertValue);
            if (convertRange) {
              diagnostics.push(
                new vscode.Diagnostic(
                  convertRange,
                  "_convert_ must be one of: none, partial, all, object",
                  vscode.DiagnosticSeverity.Error,
                ),
              );
            }
          }
        }
      }
    }

    // Recursively validate nested objects
    for (const value of Object.values(node)) {
      if (typeof value === "object") {
        await validateNode(value);
      }
    }
  }

  await validateNode(yaml);
  return diagnostics;
}

function isValidTargetSyntax(target: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$/.test(target);
}
