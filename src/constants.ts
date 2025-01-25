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
import hydra.utils
hydra.utils.get_object('%s')
`,
  GET_OBJECT_LOCATION: `
import inspect
import json
import hydra.utils

def get_object_location(path):
   try:
       obj = hydra.utils.get_object(path)
       
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
import hydra.utils
obj = hydra.utils.get_object('\${modulePath}')
attrs = [attr for attr in dir(obj) if not attr.startswith('_')]
print('\\n'.join(attrs))
`,
  CHECK_CALLABLE_TEMPLATE: `
import inspect
import hydra

def check_callable(path):
    obj = hydra.utils.get_object(path)
    return inspect.isclass(obj) or callable(obj)

is_callable = check_callable('%s')
if not is_callable:
    print('Warning: %s is not callable')
`,
  GET_CALLABLE_ARGS: `
import inspect
import hydra.utils
import json

def get_callable_args(path):
    try:
        obj = hydra.utils.get_object('%s')
        if inspect.isclass(obj):
            sig = inspect.signature(obj.__init__)
        else:
            sig = inspect.signature(obj)
        params = [name for name, param in sig.parameters.items() 
                 if name != 'self']
        return params
    except Exception as e:
        print(f'Error: {str(e)}', file=sys.stderr)
        return None

print(json.dumps(get_callable_args('%s')))
`,
} as const;

export const ConvertComletions = {
  NONE: "none",
  PARTIAL: "partial",
  OBJECT: "object",
  ALL: "all",
} as const;
