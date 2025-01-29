import * as vscode from "vscode";
import { HYDRA_KEYWORDS, HYDRA_UTILS_FUNCTIONS } from "../constants";
import { findRange } from "../utils/documentUtils";
import { getCallableParameters, hasVarKeywordParam, isCallable, validatePythonImportPath } from "../utils/pythonUtils";
import { isHydraReference } from "../utils/referenceUtils";
import { DiagnosticValidator } from "./types";

export class TargetDiagnosticValidator extends DiagnosticValidator {
  async validate(node: any): Promise<vscode.Diagnostic[]> {
    const diagnostics: vscode.Diagnostic[] = [];
    if (!(HYDRA_KEYWORDS.TARGET in node)) {
      return diagnostics;
    }

    const targetValue = node[HYDRA_KEYWORDS.TARGET];
    const range = findRange(this.document, HYDRA_KEYWORDS.TARGET, targetValue);
    if (!range || isHydraReference(targetValue)) {
      return diagnostics;
    }

    // 基本的なターゲット構文チェック
    if (!this.isValidTargetSyntax(targetValue)) {
      diagnostics.push(this.createDiagnostic({
        range,
        message: "Invalid _target_ format. Must be a fully qualified import path (e.g. 'package.module.class')",
        severity: vscode.DiagnosticSeverity.Error,
      }));
      return diagnostics;
    }

    // Hydraのユーティリティ関数の検証
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

    // Pythonのインポートパスの検証
    const importValidation = await validatePythonImportPath(targetValue);
    if (!importValidation.isValid && importValidation.error) {
      diagnostics.push(this.createDiagnostic({
        range,
        message: importValidation.error,
        severity: vscode.DiagnosticSeverity.Error,
      }));
      return diagnostics;
    }

    // callable かどうかの検証
    const isCallableObj = await isCallable(targetValue);
    if (!isCallableObj) {
      diagnostics.push(this.createDiagnostic({
        range,
        message: `Warning: '${targetValue}' is not callable`,
        severity: vscode.DiagnosticSeverity.Warning,
      }));
      return diagnostics;
    }
    // 引数のバリデーション
    await this.validateArguments(node, targetValue, diagnostics);

    return diagnostics;
  }

  private isValidTargetSyntax(target: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)+$/.test(target);
  }

  /**
   * Validates the arguments provided in the YAML configuration against the callable's parameters.
   */
  private async validateArguments(
    node: any,
    targetValue: string,
    diagnostics: vscode.Diagnostic[],
  ): Promise<void> {
    // **kwargsがある場合は検証をスキップ
    const hasVarKwargs = await hasVarKeywordParam(targetValue);
    if (hasVarKwargs) {
      return;
    }

    const parameters = await getCallableParameters(targetValue);
    if (!parameters) {
      return;
    }

    // 許可された引数名のセットを作成
    const validArgNames = new Set(parameters.map(p => p.name));

    // Hydraのキーワードをvalidな引数として追加
    Object.values(HYDRA_KEYWORDS).forEach(keyword => {
      validArgNames.add(keyword);
    });

    // YAMLで指定された各引数をチェック
    for (const [key, value] of Object.entries(node)) {
      if (key === HYDRA_KEYWORDS.TARGET) continue;

      if (!validArgNames.has(key)) {
        // valueをstring型に変換する
        const valueStr = typeof value === "string" ? value : JSON.stringify(value);
        const argRange = findRange(this.document, key, valueStr);
        if (argRange) {
          diagnostics.push(this.createDiagnostic({
            range: argRange,
            message: `Unknown argument '${key}' for callable '${targetValue}'`,
            severity: vscode.DiagnosticSeverity.Error,
          }));
        }
      }
    }
  }
}
