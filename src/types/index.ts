interface InterfaceExtractorOptions {
  includePrivate: boolean;
  includeExportKeyword: boolean;
  includeDecorators: boolean;
}

interface LanguageExtractor {
  extractInterface(sourceCode: string, options: InterfaceExtractorOptions): string;
  supportedExtensions: string[];
}
