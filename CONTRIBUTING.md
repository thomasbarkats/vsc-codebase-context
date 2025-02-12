# Contributing to VS Code File Interface Extractor

Welcome to the File Interface Extractor project! This extension helps developers extract interfaces from various programming languages. Here's how you can contribute to the project.

## Project Structure

```
src/
├── commands/               # Command implementations
│   ├── copyStructure.ts    # File structure copying
│   └── copyInterface.ts    # Interface extraction
├── services/
│   └── extractorFactory.ts # Factory for lazy-loaded extractors
├── extractors/             # Language-specific extractors
│   ├── typescript.ts       # TypeScript/JavaScript extractor
│   ├── python.ts           # Python extractor
│   └── index.ts            # Extractors exports
├── types/
│   └── index.ts            # Type definitions
└── extension.ts            # Extension entry point
```

## Key Components

### ExtractorFactory

The `ExtractorFactory` manages language extractors with lazy loading capabilities. Each extractor is loaded only when needed for a specific file type.

```typescript
ExtractorFactory.register(
    ['.ts', '.js', '.tsx', '.jsx'], 
    () => import('../extractors/typescript').then(m => new m.TypeScriptExtractor())
);
```

### Language Extractors

Each language extractor must implement the `LanguageExtractor` interface:

```typescript
interface LanguageExtractor {
    extractInterface(sourceCode: string, options: InterfaceExtractorOptions): string;
    supportedExtensions: string[];
}
```

## Adding Support for a New Language

1. Create a new extractor file in `src/extractors/` (e.g., `java.ts`)
2. Implement the `LanguageExtractor` interface
3. Register the extractor in `ExtractorFactory`:
```typescript
ExtractorFactory.register(
    ['.java'],
    () => import('../extractors/java').then(m => new m.JavaExtractor())
);
```
4. Update the `when` clause in `package.json` to include the new extension:
```json
"when": "resourceExtname =~ /\\.(ts|js|jsx|tsx|py|java)$/"
```

### Best Practices for Extractors

1. Handle language-specific syntax carefully
2. Properly map language types to TypeScript types
3. Support relevant code structures (classes, interfaces, methods)
4. Include comprehensive error handling
5. Add appropriate type annotations
6. Handle edge cases for the specific language

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vscode-file-interface-extractor.git
```

2. Install dependencies:
```bash
npm install
```

#### To install the extension locally:
```bash
npm run package && code --install-extension $(ls -t vsc-codebase-context-*.vsix | head -n 1)
```
Then `Ctrl + Shift + P` >  "Developer: Reload Window"

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the project's code style
4. Update documentation if needed
5. Submit a PR with a clear description of changes
6. Ensure CI checks pass

## Code Style Guidelines

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Keep functions focused and manageable
- Use consistent formatting

## Getting Help

- Open an issue for bugs or feature requests
- Tag issues appropriately
- Provide clear reproduction steps for bugs
- Include example code when relevant

## AI Transparency
This project was initially co-created with Claude.ai. We believe AI is a powerful tool for developer collaboration - but it's important to always mention this collaboration explicitly and transparently. When contributing:
- If you use AI tools to help with your contributions, please mention it in your PR description
- Always review and validate AI-generated code before submitting
- Include which AI tools were used
