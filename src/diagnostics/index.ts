import * as vscode from "vscode";
import { parse as parseYaml } from "yaml";
import { DIAGNOSTIC_COLLECTION_NAME } from "../constants";
import { ConvertDiagnosticValidator } from "./convertDiagnostics";
import { PartialDiagnosticValidator } from "./partialDiagnostics";
import { validateRelativePaths } from "./relativePath";
import { TargetDiagnosticValidator } from "./targetDiagnostics";
import { DiagnosticValidator } from "./types";

let diagnosticCollection: vscode.DiagnosticCollection;

export function initDiagnostics(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_COLLECTION_NAME);
  context.subscriptions.push(
    diagnosticCollection,
    vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.languageId === "yaml") validateDocument(e.document);
    }),
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor?.document.languageId === "yaml") validateDocument(editor.document);
    }),
  );
}

async function validateDocument(document: vscode.TextDocument) {
  const diagnostics: vscode.Diagnostic[] = [];

  try {
    const yaml = parseYaml(document.getText());
    const validators = [
      new TargetDiagnosticValidator(document),
      new ConvertDiagnosticValidator(document),
      new PartialDiagnosticValidator(document),
    ];

    for (const validator of validators) {
      await validateNode(yaml, validator, diagnostics);
    }

    diagnostics.push(...await validateRelativePaths(yaml, document));
  } catch (error) {
    if (error instanceof Error) {
      diagnostics.push(
        new vscode.Diagnostic(
          new vscode.Range(0, 0, document.lineCount, 0),
          `YAML parse error: ${error.message}`,
          vscode.DiagnosticSeverity.Error,
        ),
      );
    }
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

async function validateNode(
  node: any,
  validator: DiagnosticValidator,
  diagnostics: vscode.Diagnostic[],
) {
  if (!node || typeof node !== "object") return;

  diagnostics.push(...await validator.validate(node));
  for (const value of Object.values(node)) {
    if (typeof value === "object") {
      await validateNode(value, validator, diagnostics);
    }
  }
}

export function clearDiagnostics() {
  diagnosticCollection?.clear();
}
