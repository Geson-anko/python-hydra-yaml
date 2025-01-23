import * as vscode from "vscode";
import { parse as parseYaml } from "yaml";
import { DIAGNOSTIC_COLLECTION_NAME } from "../constants";
import { validateImportPaths } from "./importPathDiagnostic";
import { validateRelativePaths } from "./relativePath";
import { validateTargets } from "./targetDiagnostics";

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

    diagnostics.push(
      ...(await validateImportPaths(yaml, document)),
      ...(await validateTargets(yaml, document)),
      ...(await validateRelativePaths(yaml, document)),
    );
  } catch (error) {
    // YAMLパースエラーは無視
  }

  diagnosticCollection.set(document.uri, diagnostics);
}

export function clearDiagnostics() {
  diagnosticCollection?.clear();
}
