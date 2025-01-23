/**
 * Interface for diagnostic validation results.
 */

import * as vscode from "vscode";

export interface DiagnosticResult {
  range: vscode.Range;
  message: string;
  severity: vscode.DiagnosticSeverity;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
