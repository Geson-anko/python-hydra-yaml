// src/commands/index.ts
import * as vscode from "vscode";
import { COMMANDS } from "../constants";
import { selectPythonInterpreter } from "./selectPythonInterpreter";
import { selectRootConfigFile } from "./selectRootConfigFile";

export function registerCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.SELECT_PYTHON_INTERPRETER, selectPythonInterpreter),
    vscode.commands.registerCommand(COMMANDS.SELECT_ROOT_CONFIG, selectRootConfigFile),
  );
}
