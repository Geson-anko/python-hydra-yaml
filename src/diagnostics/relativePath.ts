// src/diagnostics/relativePath.ts
import * as vscode from "vscode";
import { findRange } from "../utils/documentUtils";

interface PathContext {
  currentPath: string[];
  rootObj: any;
}

interface CircularReferenceResult {
  isCircular: boolean;
  referencePath?: string;
  cycle?: string[];
}

export async function validateRelativePaths(yaml: any, document: vscode.TextDocument): Promise<vscode.Diagnostic[]> {
  const diagnostics: vscode.Diagnostic[] = [];

  function traverseObject(obj: any, context: PathContext) {
    if (!obj || typeof obj !== "object") return;

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = [...context.currentPath, key];

      if (typeof value === "string") {
        validateStringReferences(value, {
          ...context,
          currentPath,
        });
      } else if (typeof value === "object") {
        traverseObject(value, {
          ...context,
          currentPath,
        });
      }
    });
  }

  function detectCircularReferences(
    currentPath: string[],
    relativePath: string,
    dotCount: number,
    yaml: any,
    visited: Set<string> = new Set(),
    referenceChain: string[] = [],
  ): CircularReferenceResult {
    let targetPath = [...currentPath];
    for (let i = 0; i < dotCount - 1; i++) {
      targetPath.pop();
    }
    const pathSegments = relativePath.slice(dotCount).split(".");
    const absolutePath = [...targetPath.slice(0, -1), ...pathSegments].join(".");

    if (visited.has(absolutePath)) {
      const cycleStart = referenceChain.indexOf(absolutePath);
      const cycle = referenceChain.slice(cycleStart).concat(absolutePath);
      return {
        isCircular: true,
        referencePath: absolutePath,
        cycle: cycle,
      };
    }

    visited.add(absolutePath);
    referenceChain.push(absolutePath);

    let target = yaml;
    for (const segment of absolutePath.split(".")) {
      if (!target || typeof target !== "object") break;
      target = target[segment];
    }

    if (typeof target === "string") {
      const matches = target.match(/\${(\.+[^}]+)}/g);
      if (matches) {
        for (const match of matches) {
          const nextRelativePath = match.slice(2, -1);
          const nextDotCount = nextRelativePath.match(/^\.+/)?.[0].length ?? 0;
          const result = detectCircularReferences(
            absolutePath.split("."),
            nextRelativePath,
            nextDotCount,
            yaml,
            new Set(visited),
            [...referenceChain],
          );
          if (result.isCircular) {
            return result;
          }
        }
      }
    }

    return { isCircular: false };
  }

  function resolveReference(path: string, dotCount: number, context: PathContext): {
    exists: boolean;
  } {
    let targetPath = [...context.currentPath];
    for (let i = 0; i < dotCount - 1; i++) {
      targetPath.pop();
    }

    let target = context.rootObj;
    const pathSegments = path.split(".");

    for (const segment of pathSegments) {
      if (Array.isArray(target)) {
        const index = parseInt(segment);
        if (isNaN(index) || index >= target.length) {
          return { exists: false };
        }
        target = target[index];
      } else if (target && typeof target === "object") {
        if (!(segment in target)) {
          return { exists: false };
        }
        target = target[segment];
      } else {
        return { exists: false };
      }
    }

    return { exists: true };
  }

  function validateStringReferences(value: string, context: PathContext) {
    const matches = value.match(/\${(\.+[^}]+)}/g);
    if (!matches) return;

    matches.forEach(match => {
      const relativePath = match.slice(2, -1);
      const dotCount = relativePath.match(/^\.+/)?.[0].length ?? 0;

      const range = findRange(document, "${", match);
      if (!range) return;

      // 循環参照チェック
      const circularResult = detectCircularReferences(
        context.currentPath,
        relativePath,
        dotCount,
        context.rootObj,
      );

      if (circularResult.isCircular) {
        const cycleDescription = circularResult.cycle
          ? `Reference cycle: ${circularResult.cycle.join(" -> ")}`
          : `Circular reference with '${circularResult.referencePath}'`;

        diagnostics.push(
          new vscode.Diagnostic(
            range,
            cycleDescription,
            vscode.DiagnosticSeverity.Error,
          ),
        );
        return;
      }

      // ファイル階層超過チェック
      if (dotCount > context.currentPath.length + 1) {
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            "Reference exceeds file root level",
            vscode.DiagnosticSeverity.Warning,
          ),
        );
        return;
      }

      // 参照先の存在チェック
      const resolvedRef = resolveReference(
        relativePath.slice(dotCount),
        dotCount,
        context,
      );

      if (!resolvedRef.exists) {
        diagnostics.push(
          new vscode.Diagnostic(
            range,
            "Referenced path not found",
            vscode.DiagnosticSeverity.Error,
          ),
        );
      }
    });
  }

  traverseObject(yaml, {
    currentPath: [],
    rootObj: yaml,
  });

  return diagnostics;
}
