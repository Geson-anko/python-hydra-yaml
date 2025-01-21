// 設定関連
export const HYDRA_SETTINGS = {
  PYTHON_PATH: "hydra.pythonPath",
  CONFIG_ROOT: "hydra.config-root",
};

// コマンドID
export const COMMANDS = {
  SELECT_PYTHON_INTERPRETER: "hydra-yaml.selectPythonInterpreter",
  SELECT_ROOT_CONFIG: "hydra-yaml.selectRootConfigFile",
};

// QuickPickアイテム
export const CUSTOM_PATH_ITEM = "$(add) Enter custom path...";

// Hydraの特殊キーワード
export const HYDRA_KEYWORDS = {
  TARGET: "_target_",
  PARTIAL: "_partial_",
  ARGS: "_args_",
};

// Hydraのビルトイン関数
export const HYDRA_UTILS_FUNCTIONS = new Set([
  "hydra.utils.get_object",
  "hydra.utils.get_class",
  "hydra.utils.get_static_method",
  "hydra.utils.get_method",
]);

// 診断関連
export const DIAGNOSTIC_COLLECTION_NAME = "hydra-yaml";

// Python関連
export const PYTHON_VALIDATION = {
  CHECK_HYDRA: "import hydra",
  IMPORT_CHECK_TEMPLATE: `
import importlib

module_parts = '%s'.rsplit('.', 1)
if len(module_parts) <= 1:
    raise ValueError(f'Invalid _target_ format: %s - must be a fully qualified object path')

module_path, object_name = module_parts
module = importlib.import_module(module_path)
getattr(module, object_name)
`,
};
