// src/diagnostics/targetDiagnostic.ts
import * as vscode from "vscode";
import { HYDRA_KEYWORDS, HYDRA_UTILS_FUNCTIONS } from "../constants";
import { findRange } from "../utils/documentUtils";

/**
 * Validates Hydra _target_ configurations in YAML files.
 * Checks syntax, required fields, and valid values for _partial_ and _convert_.
 *
 * @param yaml - Parsed YAML object to validate
 * @param document - VS Code text document
 * @returns Array of VS Code diagnostics for invalid configurations
 */
export async function validateTargets(yaml: any, document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
  const diagnostics: vscode.Diagnostic[] = [];

  traverseObject(yaml, (node, path) => {
    if (HYDRA_KEYWORDS.TARGET in node) {
      const targetValue = node[HYDRA_KEYWORDS.TARGET];
      const targetRange = findRange(document, HYDRA_KEYWORDS.TARGET, targetValue);
      if (!targetRange) return;

      // Hydraユーティリティ関数の検証
      if (HYDRA_UTILS_FUNCTIONS.has(targetValue)) {
        if (!node.path) {
          diagnostics.push(
            new vscode.Diagnostic(
              targetRange,
              `'path' field is required when using ${targetValue}`,
              vscode.DiagnosticSeverity.Error,
            ),
          );
        }
      }

      // _target_の構文検証
      if (!isValidTargetSyntax(targetValue)) {
        diagnostics.push(
          new vscode.Diagnostic(
            targetRange,
            "Invalid _target_ format. Must be a fully qualified import path (e.g. 'package.module.class')",
            vscode.DiagnosticSeverity.Error,
          ),
        );
      }

      // _partial_がある場合の検証
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

      // _convert_がある場合の検証
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
  });

  return diagnostics;
}

function isValidTargetSyntax(target: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$/.test(target);
}

function traverseObject(obj: any, callback: (node: any, path: string[]) => void, path: string[] = []) {
  if (!obj || typeof obj !== "object") return;

  callback(obj, path);

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object") {
      traverseObject(value, callback, [...path, key]);
    }
  }
}
