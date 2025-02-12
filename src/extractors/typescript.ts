import * as ts from 'typescript';

export class TypeScriptExtractor implements LanguageExtractor {
  supportedExtensions = ['.ts', '.js', '.tsx', '.jsx'];

  extractInterface(sourceCode: string, options: InterfaceExtractorOptions): string {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    let interfaces: string[] = [];
    let currentComment: string | undefined;
    let indentationLevel = 0;

    const getJSDocComment = (node: ts.Node): string | undefined => {
      const jsDoc = (node as any).jsDoc;
      if (!jsDoc || !jsDoc.length) return undefined;

      return jsDoc
        .map((doc: any) => {
          const tags = doc.tags?.map((tag: any) => {
            const tagText = tag.comment ? 
              ` * @${tag.tagName.text} ${typeof tag.comment === 'string' ? tag.comment : tag.comment.map((c: any) => c.text).join('')}` :
              ` * @${tag.tagName.text}`;
            return tagText;
          }) || [];

          let comment = doc.comment;
          if (typeof comment === 'string') {
            return `/**\n * ${comment}${tags.length ? '\n' + tags.join('\n') : ''}\n */`;
          }
          if (Array.isArray(comment)) {
            return `/**\n${comment.map((c: any) => ` * ${c.text}`).join('\n')}${tags.length ? '\n' + tags.join('\n') : ''}\n */`;
          }
          if (tags.length) {
            return `/**\n${tags.join('\n')}\n */`;
          }
          return undefined;
        })
        .filter(Boolean)
        .join('\n');
    };

    const getModifiers = (node: ts.Node): string => {
      const modifiers = node.modifiers || [];
      return modifiers
        .map(modifier => {
          // Only include export keyword if specified in options
          if (modifier.kind === ts.SyntaxKind.ExportKeyword && !options.includeExportKeyword) {
            return '';
          }
          return modifier.getText() + ' ';
        })
        .join('');
    };

    const getTypeParameters = (node: ts.Node): string => {
      // Check if node has type parameters
      const nodeWithTypeParams = node as { typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration> };
      if (!nodeWithTypeParams.typeParameters?.length) return '';
      
      return `<${nodeWithTypeParams.typeParameters.map(tp => {
        let typeParam = tp.name.getText();
        if (tp.constraint) {
          typeParam += ` extends ${tp.constraint.getText()}`;
        }
        if (tp.default) {
          typeParam += ` = ${tp.default.getText()}`;
        }
        return typeParam;
      }).join(', ')}>`;
    };

    const getFunctionSignature = (node: ts.FunctionDeclaration | ts.MethodDeclaration): string => {
      let signature = getModifiers(node);

      if (ts.isFunctionDeclaration(node)) {
        signature += `function ${node.name?.getText() || ''}`;
      } else {
        signature += `${node.name.getText()}`;
      }

      signature += getTypeParameters(node);
      signature += '(';

      signature += node.parameters
        .map(param => {
          let paramStr = '';
          const decorators = ts.canHaveDecorators(param) ? ts.getDecorators(param) : undefined;
          if (decorators?.length) {
            paramStr += decorators.map(d => d.getText()).join(' ') + ' ';
          }
          if (param.modifiers?.length) {
            paramStr += param.modifiers.map(m => m.getText()).join(' ') + ' ';
          }
          paramStr += param.name.getText();
          if (param.questionToken) {
            paramStr += '?';
          }
          if (param.type) {
            paramStr += ': ' + param.type.getText();
          }
          if (param.initializer) {
            paramStr += ' = ' + param.initializer.getText();
          }
          return paramStr;
        })
        .join(', ');

      signature += ')';

      if (node.type) {
        signature += ': ' + node.type.getText();
      }

      return signature;
    };

    const getClassSignature = (node: ts.ClassDeclaration): string => {
      if (!node.name) return '';

      let signature = getModifiers(node);
      signature += `class ${node.name.getText()}`;
      signature += getTypeParameters(node);

      if (node.heritageClauses?.length) {
        signature += ' ' + node.heritageClauses.map(clause => clause.getText()).join(' ');
      }

      return signature;
    };

    const processClassMembers = (node: ts.ClassDeclaration) => {
      interfaces.push(getClassSignature(node) + ' {');
      indentationLevel++;

      // Process class members
      node.members.forEach(member => {
        if (ts.isPropertyDeclaration(member) || 
            ts.isMethodDeclaration(member) ||
            ts.isConstructorDeclaration(member)) {
          
          // Skip private members if not included in options
          if (!options.includePrivate && 
              member.modifiers?.some(m => 
                m.kind === ts.SyntaxKind.PrivateKeyword || 
                m.kind === ts.SyntaxKind.ProtectedKeyword)) {
            return;
          }

          const comment = getJSDocComment(member);
          if (comment) {
            interfaces.push('  '.repeat(indentationLevel) + comment);
          }

          let memberText = '  '.repeat(indentationLevel);
          if (ts.isConstructorDeclaration(member)) {
            memberText += 'constructor';
          } else {
            memberText += getModifiers(member);
            memberText += member.name?.getText() || '';
          }

          if (ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member)) {
            memberText += '(';
            memberText += member.parameters
              .map(param => {
                let paramStr = '';
                if (param.modifiers?.length) {
                  paramStr += param.modifiers.map(m => m.getText()).join(' ') + ' ';
                }
                paramStr += param.name.getText();
                if (param.questionToken) {
                  paramStr += '?';
                }
                if (param.type) {
                  paramStr += ': ' + param.type.getText();
                }
                return paramStr;
              })
              .join(', ');
            memberText += ')';
            
            if (member.type && !ts.isConstructorDeclaration(member)) {
              memberText += ': ' + member.type.getText();
            }
          } else if (ts.isPropertyDeclaration(member)) {
            if (member.questionToken) {
              memberText += '?';
            }
            if (member.type) {
              memberText += ': ' + member.type.getText();
            }
          }

          memberText += ';';
          interfaces.push(memberText);
        }
      });

      indentationLevel--;
      interfaces.push('  '.repeat(indentationLevel) + '}');
      interfaces.push('');
    };

    const visit = (node: ts.Node) => {
      const comment = getJSDocComment(node);
      if (comment) {
        currentComment = comment;
      }

      if (ts.isFunctionDeclaration(node)) {
        if (!options.includePrivate &&
          !node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
          return;
        }

        if (currentComment) {
          interfaces.push(currentComment);
        }
        interfaces.push(getFunctionSignature(node) + ';');
        interfaces.push('');
        currentComment = undefined;
      }

      else if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        if (!options.includePrivate &&
          !node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
          return;
        }

        if (currentComment) {
          interfaces.push(currentComment);
        }
        interfaces.push(node.getText());
        interfaces.push('');
        currentComment = undefined;
      }

      else if (ts.isClassDeclaration(node)) {
        if (!options.includePrivate &&
          !node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
          return;
        }

        if (currentComment) {
          interfaces.push(currentComment);
        }
        processClassMembers(node);
        currentComment = undefined;
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return interfaces.join('\n');
  }
}
