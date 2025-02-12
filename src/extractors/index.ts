// Registry of all language extractors

import { TypeScriptExtractor } from "./typescript";

export const extractors: LanguageExtractor[] = [
  new TypeScriptExtractor()
];
