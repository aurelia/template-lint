import { FileTask } from '../file-task';
import { File, FileKind, FileLocation } from '../file';
import { IFile, ISourceFile, IHTMLFile } from '../file';
import { Fetch } from '../fetch';
import { Issue, IssueSeverity } from '../issue';
import { Options } from '../options';
import { ASTNode, ASTElementNode } from '../ast';
import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';
import { Reflection } from '../reflection/reflection';
import { Resource, ResourceKind } from '../resource';

import * as ts from 'typescript';

/** Extract Aurelia Resources */
export class SourceGatherResourcesTask implements FileTask {
  constructor(private opts: Options) { }

  async process(file: File, fetch: Fetch): Promise<boolean> {
    if (this.isSourceFile(file)) {
      await this.extract(file);
    }
    return false;
  }

  async extract(file: ISourceFile): Promise<void> {
    const source = file.source;
    const exportedClasses = this.getExportedClasses(source);

    for (var exportedClass of exportedClasses) {

      let decorators = exportedClass.decorators || [];

      for (var decorator of decorators) {
        var exp = decorator.expression;

        if (this.isCallExpression(exp)) {
          let callStr = exp.expression.getText();
          let args = exp.arguments;

          let customElementString = "customElement";

          switch (callStr) {
            case customElementString:
              if (args.length == 1 && args[0].kind == ts.SyntaxKind.StringLiteral) {
                this.registerCustomElement((<ts.StringLiteral>args[0]).text, exportedClass, file);
              }
              break;
            default:
              break;
          }
        }
      }
    }
  }
  private registerCustomElement(name: string, decl: ts.ClassDeclaration, file: ISourceFile) {
    file.resources = file.resources || [];
    file.resources.push(new Resource(ResourceKind.Element, decl));
  }

  private isSourceFile(file: IFile): file is ISourceFile {
    return file.kind === FileKind.Source;
  }

  private isCallExpression(node: ts.Node): node is ts.CallExpression {
    return node.kind == ts.SyntaxKind.CallExpression;
  }

  private getDecoratorNode(node: ts.ClassDeclaration, decorator: string): ts.Decorator | undefined {
    if (node.decorators == null)
      return undefined;

    console.log(node.decorators[0].expression);
  }

  private getExportedClasses(source: ts.SourceFile) {
    return source.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration && this.isNodeExported(x)).map(x => <ts.ClassDeclaration>x);
  }

  private isNodeExported(node: ts.Node): boolean {
    return ((node.flags & ts.NodeFlags.Export) !== 0) && (node.parent != null && node.parent.kind === ts.SyntaxKind.SourceFile);
  }
}
