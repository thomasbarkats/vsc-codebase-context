import * as path from 'path';
import { extractors } from "../extractors";


export class InterfaceExtractorService {
  private extractors: LanguageExtractor[];

  constructor() {
      this.extractors = extractors;
  }

  getExtractorForFile(filePath: string): LanguageExtractor | undefined {
      const extension = path.extname(filePath);
      return this.extractors.find(extractor => 
          extractor.supportedExtensions.includes(extension)
      );
  }

  extractInterface(filePath: string, sourceCode: string, options: InterfaceExtractorOptions): string {
      const extractor = this.getExtractorForFile(filePath);
      if (!extractor) {
          throw new Error('No extractor found for this file type');
      }
      return extractor.extractInterface(sourceCode, options);
  }
}
