import * as vscode from "vscode";
import { HYDRA_KEYWORDS } from "../constants";
import { findRange } from "../utils/documentUtils";
import { DiagnosticValidator } from "./types";

export class ConvertDiagnosticValidator extends DiagnosticValidator {
  private readonly VALID_VALUES = ["none", "partial", "all", "object"];

  async validate(node: any): Promise<vscode.Diagnostic[]> {
    if (!(HYDRA_KEYWORDS.CONVERT in node)) {
      return [];
    }

    const value = node[HYDRA_KEYWORDS.CONVERT];
    if (!this.VALID_VALUES.includes(value)) {
      const range = findRange(this.document, HYDRA_KEYWORDS.CONVERT, value);
      if (range) {
        return [this.createDiagnostic({
          range,
          message: `_convert_ must be one of: ${this.VALID_VALUES.join(", ")}`,
          severity: vscode.DiagnosticSeverity.Error,
        })];
      }
    }
    return [];
  }
}
