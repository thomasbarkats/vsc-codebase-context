export class PythonExtractor implements LanguageExtractor {
  supportedExtensions = ['.py'];

  extractInterface(sourceCode: string, options: InterfaceExtractorOptions): string {
    const lines = sourceCode.split('\n');
    const interfaces: string[] = [];
    let currentClass: string | null = null;
    let inMethod = false;
    let currentIndentation = 0;
    let docstring = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip empty lines, comments, and string literals
      if (!trimmedLine ||
        trimmedLine.startsWith('#') ||
        trimmedLine.startsWith("'") ||
        trimmedLine.startsWith('"') ||
        trimmedLine.startsWith('f"') ||
        trimmedLine.startsWith("f'")) {
        continue;
      }

      // Handle class definitions
      if (trimmedLine.startsWith('class ')) {
        const classMatch = trimmedLine.match(/class\s+(\w+)(?:\((.*?)\))?:/);
        if (classMatch) {
          if (currentClass) {
            interfaces.push('}');
          }

          currentClass = classMatch[1];
          docstring = '';
          currentIndentation = line.search(/\S/);
          interfaces.push(`interface ${currentClass} {`);

          // Look ahead for docstring
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.startsWith('"""') || nextLine.startsWith("'''")) {
              docstring = this.extractDocstring(lines.slice(i + 1));
              i += docstring.split('\n').length;
            }
          }
        }
        continue;
      }

      // Handle methods and attributes within classes
      if (currentClass && line.search(/\S/) > currentIndentation) {
        if (trimmedLine.startsWith('def ')) {
          inMethod = true;
          const methodMatch = trimmedLine.match(/def\s+(\w+)\s*\((.*?)\)(?:\s*->\s*(.+?))?\s*:/);
          if (methodMatch) {
            const [_, methodName, params, returnType] = methodMatch;
            const formattedParams = this.formatParameters(params);
            const formattedReturn = returnType ? this.formatType(returnType.trim()) : 'void';
            interfaces.push(`    ${methodName}(${formattedParams}): ${formattedReturn}`);
          }
        } else if (!inMethod && trimmedLine.includes(':') && !trimmedLine.startsWith('"""')) {
          // Handle class attributes with type hints
          const attrMatch = trimmedLine.match(/^(\w+):\s*(.+?)(?:\s*=.*)?$/);
          if (attrMatch) {
            const [_, attrName, attrType] = attrMatch;
            interfaces.push(`    ${attrName}: ${this.formatType(attrType.trim())}`);
          }
        }
      } else {
        inMethod = false;
      }
    }

    // Close the last interface
    if (currentClass) {
      interfaces.push('}');
    }

    return interfaces.join('\n');
  }

  private formatParameters(params: string): string {
    if (!params.trim()) return '';

    return params.split(',')
      .map(param => {
        param = param.trim();
        if (!param || param === 'self') return '';

        // Handle default values
        const [paramDef, defaultValue] = param.split('=').map(p => p.trim());
        const [paramName, paramType] = paramDef.split(':').map(p => p.trim());

        // If parameter has a type annotation
        if (paramType) {
          return `${paramName}${defaultValue ? '?' : ''}: ${this.formatType(paramType)}`;
        }
        // If parameter has no type annotation
        return `${paramName}: any`;
      })
      .filter(Boolean)
      .join(', ');
  }

  private formatType(type: string): string {
    // Clean up the type string
    type = type.replace(/\s+/g, ' ').trim();

    // Basic Python to TypeScript type mapping
    const typeMap: { [key: string]: string } = {
      'str': 'string',
      'int': 'number',
      'float': 'number',
      'bool': 'boolean',
      'dict': 'Record<string, any>',
      'list': 'Array<any>',
      'List': 'Array',
      'Dict': 'Record',
      'Set': 'Set',
      'Tuple': 'Tuple',
      'None': 'void',
      'Any': 'any',
      'Optional': 'null |'
    };

    // Handle None/Optional types
    if (type === 'None') return 'null';
    if (type.startsWith('Optional[')) {
      const innerType = type.slice(9, -1);
      return `${this.formatType(innerType)} | null`;
    }

    // Handle Union types (including Optional)
    if (type.includes('|')) {
      return type.split('|')
        .map(t => this.formatType(t.trim()))
        .join(' | ');
    }

    // Handle generic types
    if (type.includes('[')) {
      const match = type.match(/(\w+)\[(.*)\]/);
      if (match) {
        const [_, baseType, genericParams] = match;
        const formattedBaseType = typeMap[baseType] || baseType;

        // Special handling for Tuple
        if (baseType === 'Tuple') {
          const innerTypes = genericParams.split(',')
            .map(t => this.formatType(t.trim()));
          return `[${innerTypes.join(', ')}]`;
        }

        // Handle nested generic parameters
        const formattedGenericParams = genericParams.split(',')
          .map(param => this.formatType(param.trim()))
          .join(', ');

        if (baseType === 'List') return `Array<${formattedGenericParams}>`;
        if (baseType === 'Dict') {
          const [keyType, valueType] = formattedGenericParams.split(',').map(t => t.trim());
          return `Record<${keyType}, ${valueType}>`;
        }

        return `${formattedBaseType}<${formattedGenericParams}>`;
      }
    }

    return typeMap[type] || type;
  }

  private extractDocstring(lines: string[]): string {
    let docstring = '';
    let i = 0;
    const quote = lines[0].trim().startsWith('"""') ? '"""' : "'''";

    // Skip the opening quote
    if (lines[0].trim() === quote) {
      i = 1;
    } else {
      docstring = lines[0].trim().slice(3);
      if (docstring.endsWith(quote)) {
        return docstring.slice(0, -3);
      }
      i = 1;
    }

    // Collect docstring lines until closing quote
    for (; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.endsWith(quote)) {
        docstring += (docstring ? '\n' : '') + line.slice(0, -3);
        break;
      }
      docstring += (docstring ? '\n' : '') + line;
    }

    return docstring;
  }
}
