![logo](./images/logo.png)

# Python Hydra YAML

VSCode extension providing intelligent autocompletion and validation for Hydra configuration files.

About Hydra: <https://hydra.cc>

**WARNING ⚠️: This extension conflicts with [`redhat.vscode-yaml`](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)**

## Features

![demo](./images/demo.gif)

### Intelligent Completion

- Python import path completion for `_target_` fields with active environment inspection
- Smart completion for Hydra special keywords (`_partial_`, `_args_`, `_recursive_`, `_convert_`) with documentation
- Argument completion based on target Python classes

### Validation & Diagnostics

- Real-time Python import path validation against active environment
- Single-file circular reference detection
- Path hierarchy violation checks
- Hydra keyword value validation
- Missing reference validation within files

### Navigation

- Go-to-definition for Python classes and methods
- Jump to reference definitions within the same file
- Documentation preview on hover for Hydra keywords

## Requirements

- Visual Studio Code 1.96.0+
- Python extension for VS Code
- Python environment with Hydra installed

## Setup

1. Install the extension from VSCode marketplace
2. Select your Python interpreter: `Python: Select Interpreter`

## Usage

The extension activates automatically for `.yaml` files. Features are accessible through:

- Typing triggers like `_target_:` or `${`
- IntelliSense (Ctrl+Space)
- Go to Definition (F12)

## Known Issues & Limitations

- Cross-file reference validation and completion not supported
- Complex circular reference patterns may not be fully detected
- Python import validation requires packages installed in interpreter
- Some completion triggers limited to specific characters
- No file watching for external config changes

## Contributing

Source code: <https://github.com/Geson-anko/python-hydra-yaml>

## License

MIT
