import * as vscode from 'vscode';
import { validatePythonImportPath } from './pythonUtils';

let diagnosticCollection: vscode.DiagnosticCollection;

export function initDiagnostics(context: vscode.ExtensionContext) {
    // 診断コレクションを作成
    diagnosticCollection = vscode.languages.createDiagnosticCollection('hydra-yaml');
    context.subscriptions.push(diagnosticCollection);

    // ドキュメントの変更を監視
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'yaml') {
                validateDocument(event.document);
            }
        })
    );

    // エディタの切り替えを監視
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor && editor.document.languageId === 'yaml') {
                validateDocument(editor.document);
            }
        })
    );
}

async function validateDocument(document: vscode.TextDocument) {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const targetMatch = line.match(/^\s*_target_:\s*(.+)\s*$/);
        
        if (targetMatch) {
            const importPath = targetMatch[1].trim();
            const result = await validatePythonImportPath(importPath);
            
            if (!result.isValid) {
                const range = new vscode.Range(
                    new vscode.Position(i, line.indexOf(importPath)),
                    new vscode.Position(i, line.indexOf(importPath) + importPath.length)
                );
                
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Invalid Python import path: ${result.error}`,
                    vscode.DiagnosticSeverity.Error
                );
                
                diagnostics.push(diagnostic);
            }
        }
    }

    diagnosticCollection.set(document.uri, diagnostics);
}

export function clearDiagnostics() {
    if (diagnosticCollection) {
        diagnosticCollection.clear();
    }
}