import { FileTask } from '../file-task';
import { File, FileKind, FileLocation } from '../file';
import { IFile, ISourceFile, IHtmlFile } from '../file';
import { Fetch } from '../fetch';
import { Issue, IssueSeverity } from '../issue';
import { Options } from '../options';
import { ASTNode, ASTElementNode } from '../ast';
import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';
import { Reflection } from '../reflection/reflection';
import { Resource, ResourceKind } from '../resource';
import { ResourceCollection } from '../resource-collection';

import * as ts from 'typescript';

/** Analyse Exported Config Method */
export class SourceConfigTask implements FileTask {
  constructor(private opts: Options, private globalResources: ResourceCollection) { }

  async process(file: File, fetch: Fetch): Promise<boolean> {
    if (file.isSourceFile()) {
      const source = file.source;

      const exports = this.getExportedFunctions(source);

      const configure = exports.find(x => x.name!.text == "configure");

      if (!configure) return false;

      const body = configure.body;

      if (!body) return false;

      const exps = body.statements.filter(x => x.kind == ts.SyntaxKind.ExpressionStatement);

      for (var exp of exps) {
        if (this.isExpressionStatement(exp))
          await this.processExpression(exp.expression, fetch);
      }
    }
    return false;
  }

  async processExpression(exp: ts.Expression, fetch: Fetch) {
    if (this.isCallExpression(exp)) {

      let args = exp.arguments;
      let accessExp = exp.expression;

      if (this.isPropertyAccessExpression(accessExp)) {
        let methodName = accessExp.name.text;
        let methodArg;

        switch (methodName) {
          case "globalResources": {
            await this.processGlobalResourcesCall(args, fetch);
          } break;
        }
      }
    }
  }

  private async processGlobalResourcesCall(args: ts.NodeArray<ts.Expression>, fetch: Fetch) {
    if (args.length == 0)
      return;

    let arg = args[0];

    if (this.isArrayLiteralExpression(arg)) {
      let elmts = arg.elements;
      for (var elmt of elmts) {
        if (this.isStringLiteral(elmt)) {
          await this.resolveAndRegister(elmt.text, fetch);
        }
      }
    }
  }

  private async resolveAndRegister(moduleUri: string, fetch: Fetch) {
    let file = await fetch(moduleUri);

    if (file && file.isSourceFile()) {
      for (var res of file.resources) {
        this.globalResources.add(res);
      }
      //else report
    }
  }

  private isStringLiteral(exp: ts.Expression): exp is ts.StringLiteral {
    return exp.kind == ts.SyntaxKind.StringLiteral;
  }

  private isExpressionStatement(exp: ts.Statement): exp is ts.ExpressionStatement {
    return exp.kind == ts.SyntaxKind.ExpressionStatement;
  }

  private isCallExpression(exp: ts.Expression): exp is ts.CallExpression {
    return exp.kind == ts.SyntaxKind.CallExpression;
  }

  private isArrayLiteralExpression(exp: ts.Expression): exp is ts.ArrayLiteralExpression {
    return exp.kind == ts.SyntaxKind.ArrayLiteralExpression;
  }

  private isPropertyAccessExpression(exp: ts.Expression): exp is ts.PropertyAccessExpression {
    return exp.kind == ts.SyntaxKind.PropertyAccessExpression;
  }

  private getExportedFunctions(source: ts.SourceFile) {
    return source.statements.filter(x => x.kind == ts.SyntaxKind.FunctionDeclaration && this.isNodeExported(x)).map(x => <ts.FunctionDeclaration>x);
  }

  private isNodeExported(node: ts.Node): boolean {
    return ((node.flags & ts.NodeFlags.Export) !== 0) && (node.parent != null && node.parent.kind === ts.SyntaxKind.SourceFile);
  }


}
