// Hydraの特殊キーワード
export const HYDRA_KEYWORDS = {
  TARGET: "_target_",
  PARTIAL: "_partial_",
  ARGS: "_args_",
  RECURSIVE: "_recursive_",
  CONVERT: "_convert_",
};

// Hydraのビルトイン関数
export const HYDRA_UTILS_FUNCTION_NAMES = [
  "get_object",
  "get_class",
  "get_method",
  "get_static_method",
] as const;

export const HYDRA_UTILS_FUNCTIONS = new Set(
  HYDRA_UTILS_FUNCTION_NAMES.map(f => `hydra.utils.${f}`),
);

// 診断関連
export const DIAGNOSTIC_COLLECTION_NAME = "python-hydra-yaml";

// Python関連
export const PYTHON_SCRIPTS = {
  IMPORT_HYDRA: `import hydra`,
  IMPORT_CHECK_TEMPLATE: `
import importlib

module_parts = '%s'.rsplit('.', 1)
if len(module_parts) <= 1:
    raise ValueError(f'Invalid _target_ format: %s - must be a fully qualified object path')

module_path, object_name = module_parts
module = importlib.import_module(module_path)
getattr(module, object_name)
`,
  GET_OBJECT_LOCATION: `
import inspect
import importlib
import json

def get_object_location(path):
   try:
       module_path, obj_name = path.rsplit('.', 1)
       module = importlib.import_module(module_path)
       obj = getattr(module, obj_name)
       
       file_path = inspect.getfile(obj)
       try:
           source, line_no = inspect.getsourcelines(obj)
           return {'filePath': file_path, 'lineNumber': line_no}
       except:
           return {'filePath': file_path, 'lineNumber': 1}
   except Exception as e:
       print(f'Error: {str(e)}', file=sys.stderr)
       return None

print(json.dumps(get_object_location('%s')))
`,
  LIST_TOP_LEVEL_PACKAGES: `
import pkgutil
packages = [m.name for m in pkgutil.iter_modules()]
print('\\n'.join(packages))
`,
  LIST_MODULE_ATTRIBUTES: `
import importlib
module = importlib.import_module('\${modulePath}')
attrs = [attr for attr in dir(module) if not attr.startswith('_')]
print('\\n'.join(attrs))
`,
  CHECK_CALLABLE_TEMPLATE: `
import importlib
import inspect

def check_callable(path):
    module_path, obj_name = path.rsplit('.', 1)
    module = importlib.import_module(module_path)
    obj = getattr(module, obj_name)
    return inspect.isclass(obj) or callable(obj)

is_callable = check_callable('%s')
if not is_callable:
    print('Warning: %s is not callable')
`,
} as const;

export const ConvertComletions = {
  NONE: "none",
  PARTIAL: "partial",
  OBJECT: "object",
  ALL: "all",
} as const;
