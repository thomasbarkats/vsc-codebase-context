// Registry of all language extractors

import { PythonExtractor } from "./python";
import { TypeScriptExtractor } from "./typescript";

export const extractors: LanguageExtractor[] = [
  new TypeScriptExtractor(),
  new PythonExtractor(),
];
