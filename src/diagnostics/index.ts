import * as vscode from "vscode";
import { parse as parseYaml } from "yaml";
import { DIAGNOSTIC_COLLECTION_NAME } from "../constants";
import { validateRelativePaths } from "./relativePath";
import { validateTargets } from "./targetDiagnostics";

let diagnosticCollection: vscode.DiagnosticCollection;

/**
 * Initializes and manages YAML diagnostics for the extension.
 * Sets up document change listeners and validation.
 *
 * @param context - VS Code extension context
 */
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
      ...(await validateTargets(yaml, document)),
      ...(await validateRelativePaths(yaml, document)),
    );
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

export function clearDiagnostics() {
  diagnosticCollection?.clear();
}
