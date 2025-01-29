import * as vscode from "vscode";
import { HYDRA_KEYWORDS } from "../constants";
import { findRange } from "../utils/documentUtils";
import { DiagnosticValidator } from "./types";

export class RecursiveDiagnosticValidator extends DiagnosticValidator {
  async validate(node: any): Promise<vscode.Diagnostic[]> {
    if (!(HYDRA_KEYWORDS.RECURSIVE in node)) {
      return [];
    }

    const value = node[HYDRA_KEYWORDS.RECURSIVE];
    if (typeof value !== "boolean") {
      const range = findRange(this.document, HYDRA_KEYWORDS.RECURSIVE, value.toString());
      if (range) {
        return [this.createDiagnostic({
          range,
          message: `${HYDRA_KEYWORDS.RECURSIVE} must be a boolean value`,
          severity: vscode.DiagnosticSeverity.Error,
        })];
      }
    }
    return [];
  }
}
