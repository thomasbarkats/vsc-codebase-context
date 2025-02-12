# Codebase Context Clipper - VS Code Extension

[![Version](https://img.shields.io/visual-studio-marketplace/v/thomasbarkats.vsc-codebase-context)](https://marketplace.visualstudio.com/items?itemName=thomasbarkats.vsc-codebase-context)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/thomasbarkats.vsc-codebase-context)](https://marketplace.visualstudio.com/items?itemName=thomasbarkats.vsc-codebase-context)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/thomasbarkats.vsc-codebase-context)](https://marketplace.visualstudio.com/items?itemName=thomasbarkats.vsc-codebase-context)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A VS Code extension that helps you enhance AI prompts by easily extracting codebase context. Clip folder structures as tree-like formats and extract code interfaces to provide accurate context for your LLM conversations. Perfect for documentation, AI-assisted development, and sharing project insights.

## Features

### ✨ Folder Structure Copy
- Right-click any folder in VS Code's explorer
- Select "📋 Copy Structure"
- Get a nicely formatted tree structure of all files and folders
- Automatically skips `node_modules` and `.git` directories

### ✨ File Interface Copy
- Right-click any supported file in VS Code's explorer
- Select "📋 Copy File Interface"
- Get the file's interface (function signatures, types, JSDoc comments)

#### Supported Languages:
- TypeScript (.ts / .tsx)
- JavaScript (.js / .jsx)
- Python (.py)

### Perfect for:
- Creating documentation
- Sharing project structures
- LLM prompts requiring code context

## Examples

### Folder Structure
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

### File Interface
Right-click on a TypeScript file and get its interface:

```typescript
/**
 * Processes user data and returns formatted result
 * @param data - Raw user input data
 * @returns Processed and validated user data
 */
function processUserData(data: UserInput): ProcessedData

interface UserInput {
    name: string;
    age: number;
    preferences?: string[];
}
```

## Installation

### VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Folder Structure Copy"
4. Click Install

Or install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=thomasbarkats.vsc-codebase-context).

### Manual Installation
Download the `.vsix` file and install via:
```bash
code --install-extension vsc-codebase-context-1.X.X.vsix
```

## Usage

1. In VS Code's file explorer, right-click any folder
2. Select "📋 Copy Structure" from the context menu
3. The folder structure is now in your clipboard, ready to paste

## Development

To build the extension from source:

1. Clone the repository
```bash
git clone https://github.com/thomasbarkats/vsc-codebase-context.git
cd vsc-codebase-context
```

2. Install dependencies and build
```bash
npm install
npm run compile
npm run package
```

## Contributing

Contributions are welcome! Whether it's adding support for new languages, fixing bugs, or improving documentation.

Please check our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Project structure
- How to add new language support
- Development setup
- Pull request process

Feel free to submit a Pull Request or open an issue for discussion.

## License

This extension is licensed under the [MIT License](LICENSE).
