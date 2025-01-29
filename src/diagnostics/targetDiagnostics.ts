import * as vscode from "vscode";
import { HYDRA_KEYWORDS, HYDRA_UTILS_FUNCTIONS } from "../constants";
import { findRange } from "../utils/documentUtils";
import { isCallable, validatePythonImportPath } from "../utils/pythonUtils";
import { isHydraReference } from "../utils/referenceUtils";
import { DiagnosticValidator } from "./types";

export class TargetDiagnosticValidator extends DiagnosticValidator {
  async validate(node: any): Promise<vscode.Diagnostic[]> {
    if (!(HYDRA_KEYWORDS.TARGET in node)) {
      return [];
    }

    const targetValue = node[HYDRA_KEYWORDS.TARGET];
    const range = findRange(this.document, HYDRA_KEYWORDS.TARGET, targetValue);
    if (!range || isHydraReference(targetValue)) {
      return [];
    }

    const diagnostics: vscode.Diagnostic[] = [];

    if (!this.isValidTargetSyntax(targetValue)) {
      diagnostics.push(this.createDiagnostic({
        range,
        message: "Invalid _target_ format. Must be a fully qualified import path (e.g. 'package.module.class')",
        severity: vscode.DiagnosticSeverity.Error,
      }));
      return diagnostics;
    }

    if (HYDRA_UTILS_FUNCTIONS.has(targetValue)) {
      if (!node.path) {
        diagnostics.push(this.createDiagnostic({
          range,
          message: "'path' field is required",
          severity: vscode.DiagnosticSeverity.Error,
        }));
      }
      return diagnostics;
    }

    const importValidation = await validatePythonImportPath(targetValue);
    if (!importValidation.isValid && importValidation.error) {
      diagnostics.push(this.createDiagnostic({
        range,
        message: importValidation.error,
        severity: vscode.DiagnosticSeverity.Error,
      }));
      return diagnostics;
    }

    const isCallableObj = await isCallable(targetValue);
    if (!isCallableObj) {
      diagnostics.push(this.createDiagnostic({
        range,
        message: `Warning: '${targetValue}' is not callable`,
        severity: vscode.DiagnosticSeverity.Warning,
      }));
    }

    return diagnostics;
  }

  private isValidTargetSyntax(target: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$/.test(target);
  }
}
