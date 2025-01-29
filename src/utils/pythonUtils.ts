import { PythonExtension } from "@vscode/python-extension";
import { exec } from "child_process";
import { promisify } from "util";
import { HYDRA_KEYWORDS } from "../constants";

export const execAsync = promisify(exec);

/**
 * Gets the path of the currently active Python interpreter.
 */
export async function getActivePythonPath(): Promise<string | undefined> {
  try {
    const pythonApi = await PythonExtension.api();
    const activePath = pythonApi.environments.getActiveEnvironmentPath();
    return activePath?.path;
  } catch {
    return undefined;
  }
}

export async function isHydraExists(): Promise<boolean> {
  try {
    const pythonPath = await getActivePythonPath();
    if (!pythonPath) {
      return false;
    }
    await execAsync(`"${pythonPath}" -c "import hydra"`);
    return true;
  } catch {
    return false;
  }
}

const INSPECT_SCRIPT = `
import hydra.utils
import inspect
import json
import sys
from inspect import Parameter

def get_object_info(path):
   try:
       obj = hydra.utils.get_object(path)
       name = path.split('.')[-1]

       info = {
           'isValid': True,
           'isCallable': callable(obj) or inspect.isclass(obj),
           'isClass': inspect.isclass(obj),
           'isModule': inspect.ismodule(obj),
           'isFunction': inspect.isfunction(obj) or inspect.ismethod(obj),
           'isVariable': not (callable(obj) or inspect.isclass(obj) or inspect.ismodule(obj) or inspect.isfunction(obj)),
           'isConstant': name.isupper(),
           'error': None,
           'location': None,
           'parameters': None
       }

       try:
           info['location'] = {
               'filePath': inspect.getfile(obj),
               'lineNumber': inspect.getsourcelines(obj)[1]
           }
       except Exception:
           pass
           
       if info['isCallable']:
           sig = inspect.signature(obj.__init__ if info['isClass'] else obj)
           info['parameters'] = [
               {
                   'name': name,
                   'kind': str(param.kind)
               }
               for name, param in sig.parameters.items()
               if name != 'self'
           ]
       
       return info
       
   except Exception as e:
       return {
           'isValid': False,
           'error': str(e),
           'isCallable': False,
           'isClass': False,
           'isModule': False,
           'isFunction': False,
           'isVariable': False,
           'isConstant': False,
           'location': None,
           'parameters': None
       }

print(json.dumps(get_object_info('%s')))
`;

interface ParameterInfo {
  name: string;
  kind: string;
}

interface ObjectInfo {
  isValid: boolean;
  error?: string;
  isCallable: boolean;
  isClass: boolean;
  isModule: boolean;
  isFunction: boolean;
  isVariable: boolean;
  isConstant: boolean;
  location?: {
    filePath: string;
    lineNumber: number;
  };
  parameters?: ParameterInfo[]; // 引数情報を追加
}

async function getObjectInfo(importPath: string): Promise<ObjectInfo | undefined> {
  const pythonPath = await getActivePythonPath();
  if (!pythonPath) return undefined;

  try {
    const script = INSPECT_SCRIPT.replace("%s", importPath);
    const { stdout } = await execAsync(`"${pythonPath}" -c "${script}"`);
    return JSON.parse(stdout) as ObjectInfo;
  } catch (error) {
    console.error("Failed to get object info:", error);
    return undefined;
  }
}

export async function validatePythonImportPath(importPath: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  if (!importPath.includes(".")) {
    return {
      isValid: false,
      error: "Invalid import path: must be a fully qualified path",
    };
  }

  const info = await getObjectInfo(importPath);
  if (!info) {
    return { isValid: false, error: "Failed to inspect object" };
  }

  return {
    isValid: info.isValid,
    error: info.error,
  };
}

export async function isCallable(importPath: string): Promise<boolean> {
  const info = await getObjectInfo(importPath);
  return info?.isCallable ?? false;
}

export async function getPythonObjectLocation(importPath: string) {
  const info = await getObjectInfo(importPath);
  return info?.location;
}

export async function getCallableParameters(importPath: string): Promise<ParameterInfo[] | undefined> {
  const info = await getObjectInfo(importPath);
  return info?.parameters;
}

export async function getCallableArguments(importPath: string): Promise<string[] | undefined> {
  const parameters = await getCallableParameters(importPath);
  return parameters?.map(p => p.name);
}

export async function getInstantiationArgs(importPath: string): Promise<string[] | undefined> {
  const args = await getCallableArguments(importPath);
  if (!args) return undefined;

  return [
    HYDRA_KEYWORDS.PARTIAL,
    HYDRA_KEYWORDS.ARGS,
    ...args,
    HYDRA_KEYWORDS.CONVERT,
    HYDRA_KEYWORDS.RECURSIVE,
  ];
}

export async function hasVarPositionalParam(importPath: string): Promise<boolean> {
  const parameters = await getCallableParameters(importPath);
  return parameters?.some(p => p.kind === "VAR_POSITIONAL") ?? false;
}

export async function hasVarKeywordParam(importPath: string): Promise<boolean> {
  const parameters = await getCallableParameters(importPath);
  return parameters?.some(p => p.kind === "VAR_KEYWORD") ?? false;
}
