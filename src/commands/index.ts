// src/commands/index.ts
import * as vscode from "vscode";
import { COMMANDS } from "../constants";
import { selectRootConfigFile } from "./selectRootConfigFile";

export function registerCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(COMMANDS.SELECT_ROOT_CONFIG, selectRootConfigFile),
  );
}
