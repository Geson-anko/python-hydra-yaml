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

/**
 * Base class for all diagnostic validators
 */
export abstract class DiagnosticValidator {
  protected document: vscode.TextDocument;
  protected diagnostics: vscode.Diagnostic[] = [];

  constructor(document: vscode.TextDocument) {
    this.document = document;
  }

  /**
   * Validates the node and returns diagnostics
   */
  abstract validate(node: any): Promise<vscode.Diagnostic[]>;

  /**
   * Creates a diagnostic result from parameters
   */
  protected createDiagnostic(result: DiagnosticResult): vscode.Diagnostic {
    return new vscode.Diagnostic(
      result.range,
      result.message,
      result.severity,
    );
  }
}
