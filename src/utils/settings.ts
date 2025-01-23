// src/utils/settings.ts
import * as fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";

interface Settings {
  [key: string]: any; // インデックスシグネチャを追加
}

/**
 * Updates VS Code workspace settings by modifying settings.json.
 * Creates .vscode directory and settings.json if they don't exist.
 *
 * @param key - The settings key to update
 * @param value - The new value to set
 * @throws Error if no workspace folder is found or if update fails
 */
export async function updateSettings(key: string, value: string) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw new Error("No workspace folder found");
  }

  const vscodePath = path.join(workspaceFolder.uri.fsPath, ".vscode");
  const settingsPath = path.join(vscodePath, "settings.json");

  try {
    await fs.mkdir(vscodePath, { recursive: true });

    let settings: Settings = {};
    try {
      const content = await fs.readFile(settingsPath, "utf8");
      settings = JSON.parse(content);
    } catch (error) {
      // ファイルが存在しない場合は空のオブジェクトを使用
    }

    settings[key] = value;
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
  } catch (error) {
    throw new Error(`Failed to update settings: ${error}`);
  }
}
