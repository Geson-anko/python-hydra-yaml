// src/commands/index.ts
import * as vscode from "vscode";
import { selectPythonInterpreter } from "./selectPythonInterpreter";
import { selectRootConfigFile } from "./selectRootConfigFile";

export function registerCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("hydra-yaml.selectPythonInterpreter", selectPythonInterpreter),
    vscode.commands.registerCommand("hydra-yaml.selectRootConfigFile", selectRootConfigFile),
  );
}
