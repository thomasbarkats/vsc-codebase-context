export class ExtractorFactory {
  private static extractors: Map<string[], () => Promise<LanguageExtractor>> = new Map();

  static register(extensions: string[], loaderFn: () => Promise<LanguageExtractor>) {
    this.extractors.set(extensions, loaderFn);
  }

  static async getExtractor(extension: string): Promise<LanguageExtractor | null> {
    for (const [extensions, loader] of this.extractors) {
      if (extensions.includes(extension)) {
        return await loader();
      }
    }
    return null;
  }

  static getSupportedExtensions(): string[] {
    return Array.from(this.extractors.keys()).flat();
  }
}

// Register your extractors
ExtractorFactory.register(
  ['.ts', '.js', '.tsx', '.jsx'],
  () => import('./extractors/typescript').then(m => new m.TypeScriptExtractor())
);

ExtractorFactory.register(
  ['.py'],
  () => import('./extractors/python').then(m => new m.PythonExtractor())
);
