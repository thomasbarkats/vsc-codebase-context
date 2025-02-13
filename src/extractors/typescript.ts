import * as ts from 'typescript';

export class TypeScriptExtractor implements LanguageExtractor {
  supportedExtensions = ['.ts', '.js'];

  extractInterface(sourceCode: string, options: InterfaceExtractorOptions): string {
    const sourceFile = ts.createSourceFile(
      'temp.ts',
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    let declarations: string[] = [];

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

    const getTypeParameters = (node: ts.Node): string => {
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

    const convertFunctionToInterface = (node: ts.FunctionDeclaration): string => {
      if (!node.name) return '';

      const functionName = node.name.getText();
      const typeParams = getTypeParameters(node);
      let interfaceStr = `interface ${functionName}${typeParams} {\n`;
      interfaceStr += '  (';
      interfaceStr += node.parameters
        .map(param => {
          let paramStr = param.name.getText();
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
      interfaceStr += ')';
      if (node.type) {
        interfaceStr += ': ' + node.type.getText();
      }
      interfaceStr += ';\n}';

      return interfaceStr;
    };

    const convertClassToInterface = (node: ts.ClassDeclaration): string => {
      if (!node.name) return '';

      const className = node.name.getText();
      const typeParams = getTypeParameters(node);
      let interfaceStr = `interface ${className}${typeParams}`;

      // Add heritage clauses (extends and implements)
      if (node.heritageClauses) {
        node.heritageClauses.forEach(clause => {
          interfaceStr += ' ' + clause.getText();
        });
      }

      interfaceStr += ' {\n';

      // Convert class members to interface properties
      node.members.forEach(member => {
        const comment = getJSDocComment(member);
        if (comment) {
          interfaceStr += '  ' + comment + '\n';
        }

        if (ts.isConstructorDeclaration(member)) {
          interfaceStr += '  constructor(';
          interfaceStr += member.parameters
            .map(param => {
              let paramStr = '';
              if (param.modifiers?.some(m => m.kind === ts.SyntaxKind.ReadonlyKeyword)) {
                paramStr += 'readonly ';
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
          interfaceStr += ');\n';
        }
        else if (ts.isPropertyDeclaration(member)) {
          interfaceStr += '  ';
          // Add access modifiers
          if (member.modifiers) {
            member.modifiers.forEach(modifier => {
              interfaceStr += modifier.getText() + ' ';
            });
          }
          interfaceStr += member.name.getText();
          if (member.questionToken) {
            interfaceStr += '?';
          }
          if (member.type) {
            interfaceStr += ': ' + member.type.getText();
          } else if (ts.isPropertyDeclaration(member) && member.initializer) {
            interfaceStr += ': typeof ' + member.initializer.getText();
          }
          interfaceStr += ';\n';
        }
        else if (ts.isMethodDeclaration(member)) {
          interfaceStr += '  ';
          // Add access modifiers
          if (member.modifiers) {
            member.modifiers.forEach(modifier => {
              interfaceStr += modifier.getText() + ' ';
            });
          }
          interfaceStr += member.name.getText();
          if (member.questionToken) {
            interfaceStr += '?';
          }
          interfaceStr += '(';
          interfaceStr += member.parameters
            .map(param => {
              let paramStr = param.name.getText();
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
          interfaceStr += ')';
          if (member.type) {
            interfaceStr += ': ' + member.type.getText();
          }
          interfaceStr += ';\n';
        }
      });

      interfaceStr += '}';
      return interfaceStr;
    };

    const visit = (node: ts.Node) => {
      // Get comments if any
      const comment = getJSDocComment(node);

      if (ts.isClassDeclaration(node)) {
        if (comment) declarations.push(comment);
        declarations.push(convertClassToInterface(node));
        declarations.push('');
      }
      else if (ts.isFunctionDeclaration(node)) {
        if (comment) declarations.push(comment);
        declarations.push(convertFunctionToInterface(node));
        declarations.push('');
      }
      else if (ts.isInterfaceDeclaration(node)) {
        if (comment) declarations.push(comment);
        declarations.push(node.getText());
        declarations.push('');
      }
      else if (ts.isTypeAliasDeclaration(node)) {
        if (comment) declarations.push(comment);
        declarations.push(node.getText());
        declarations.push('');
      }
      else if (ts.isEnumDeclaration(node)) {
        if (comment) declarations.push(comment);
        declarations.push(node.getText());
        declarations.push('');
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return declarations.join('\n');
  }
}
