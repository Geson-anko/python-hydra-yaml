import * as vscode from "vscode";
import { HYDRA_KEYWORDS } from "../constants";
import { findRange } from "../utils/documentUtils";
import { DiagnosticValidator } from "./types";

export class PartialDiagnosticValidator extends DiagnosticValidator {
  async validate(node: any): Promise<vscode.Diagnostic[]> {
    if (!(HYDRA_KEYWORDS.PARTIAL in node)) {
      return [];
    }

    const value = node[HYDRA_KEYWORDS.PARTIAL];
    if (typeof value !== "boolean") {
      const range = findRange(this.document, HYDRA_KEYWORDS.PARTIAL, value.toString());
      if (range) {
        return [this.createDiagnostic({
          range,
          message: `${HYDRA_KEYWORDS.PARTIAL} must be a boolean value`,
          severity: vscode.DiagnosticSeverity.Error,
        })];
      }
    }
    return [];
  }
}
