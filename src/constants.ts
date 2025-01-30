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
  LIST_TOP_LEVEL_PACKAGES: `
import pkgutil
packages = [m.name for m in pkgutil.iter_modules() if not m.name.startswith('_')]
print('\\n'.join(packages))
`,
  LIST_MODULE_ATTRIBUTES: `
import hydra.utils
obj = hydra.utils.get_object('\${modulePath}')
attrs = [attr for attr in dir(obj) if not attr.startswith('_')]
print('\\n'.join(attrs))
`,
} as const;

export const ConvertComletions = {
  NONE: "none",
  PARTIAL: "partial",
  OBJECT: "object",
  ALL: "all",
} as const;
