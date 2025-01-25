![logo](./images/logo.png)

# Python Hydra YAML

VSCode extension providing intelligent autocompletion and validation for Hydra configuration files.

About Hydra: <https://hydra.cc>

**WARNING ⚠️: This extension conflict with [`redhat.vscode-yaml`](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)**

## Features

- Python import path completion for `_target_` fields.
- Reference validation for accessing other config values within the same file using relative paths (`${.value}`, `${..value}`)
- Real-time validation of Python imports
- Go-to-definition support for Python classes and Hydra references
- Auto-completion for Hydra special keywords (`_partial_`, `_args_`, `_recursive_`, `_convert_`)

![Error](./images/Errors.png)

## Requirements

- Visual Studio Code 1.96.0+
- Python extension for VS Code
- Python environment with Hydra installed

## Usage

The extension automatically activates for YAML files. Features include:

- Select your python environment with `Python: Select Interpreter`
- Type `_target_:` to trigger Python import path completion
- Use `${.}` or `${..}` for relative references within the same file
- Hover over references to preview values and see documentation
- `F12` or right-click → Go to Definition to jump to Python source or referenced values

## Known Issues

- File watching for config changes outside VSCode is not yet implemented
- Some complex circular reference patterns may not be detected
- Python import validation requires the interpreter to have all referenced packages installed
- Completion triggers are limited to space characters, which may restrict completion functionality
- Cross-file absolute path references are not supported

## Contributing

Source code available at <https://github.com/Geson-anko/python-hydra-yaml>

## License

MIT
