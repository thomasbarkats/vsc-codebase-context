# Folder Structure Copy - VS Code Extension

[![Version](https://img.shields.io/visual-studio-marketplace/v/thomasbarkats.vsc-folder-structure-copy)](https://marketplace.visualstudio.com/items?itemName=thomasbarkats.vsc-folder-structure-copy)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/thomasbarkats.vsc-folder-structure-copy)](https://marketplace.visualstudio.com/items?itemName=thomasbarkats.vsc-folder-structure-copy)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/thomasbarkats.vsc-folder-structure-copy)](https://marketplace.visualstudio.com/items?itemName=thomasbarkats.vsc-folder-structure-copy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A simple VS Code extension that adds a "Copy Structure Prompt" option when right-clicking on folders. This copies the folder structure to your clipboard in a tree-like format. Perfect for documentation, LLM prompts, or sharing project structures.

## Features

✨ One-click folder structure copying
- Right-click any folder in VS Code's explorer
- Select "📋 Copy Structure Prompt"
- Get a nicely formatted tree structure of all files and folders
- Automatically skips `node_modules` and `.git` directories

### Perfect for:
- Creating documentation
- Sharing project structures
- LLM prompts requiring folder context

## Example

Right-click on any folder and get a clean tree structure:

```
my-project/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── styles/
│   │   └── main.css
│   └── App.tsx
├── public/
│   └── index.html
├── package.json
└── tsconfig.json
```

## Installation

### VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Folder Structure Copy"
4. Click Install

Or install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=thomasbarkats.vsc-folder-structure-copy).

### Manual Installation
Download the `.vsix` file and install via:
```bash
code --install-extension vsc-folder-structure-copy-1.0.0.vsix
```

## Usage

1. In VS Code's file explorer, right-click any folder
2. Select `📋 Copy Structure Prompt` from the context menu
3. The folder structure is now in your clipboard, ready to paste

## Development

To build the extension from source:

1. Clone the repository
```bash
git clone https://github.com/thomasbarkats/vsc-folder-structure-copy.git
cd vsc-folder-structure-copy
```

2. Install dependencies and build
```bash
npm install
npm run compile
npm run package
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This extension is licensed under the [MIT License](LICENSE).