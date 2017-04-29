import { Content, ContentContext } from '../content';
import { Resolve } from '../resolve';
import { Resource } from '../resource';

import * as ts from 'typescript';

/** Analyse Exported Config Method */
export class SourceConfigTask {

  constructor(private _globals: Resource[]) {
  }

  async process(ctx: ContentContext): Promise<boolean> {
    if (Content.isSourceContent(ctx.content)) {
      const source = ctx.content.source;

      const exports = this.getExportedFunctions(source);

      const configure = exports.find(x => x.name!.text === "configure");

      if (!configure) {
        return false;
      }

      const body = configure.body;

      if (!body) { return false; }

      const exps = body.statements.filter(x => x.kind === ts.SyntaxKind.ExpressionStatement);

      for (const exp of exps) {
        if (this.isExpressionStatement(exp)) {
          await this.processExpression(exp.expression, ctx.resolve);
        }
      }
    }
    return false;
  }

  async processExpression(exp: ts.Expression, fetch: Resolve): Promise<void> {
    if (this.isCallExpression(exp)) {

      let args = exp.arguments;
      let accessExp = exp.expression;

      if (this.isPropertyAccessExpression(accessExp)) {
        let methodName = accessExp.name.text;

        switch (methodName) {
          case "globalResources": {
            await this.processGlobalResourcesCall(args, fetch);
          } break;
        }
      }
    }
  }

  private async processGlobalResourcesCall(args: ts.NodeArray<ts.Expression>, fetch: Resolve): Promise<void> {
    if (args.length === 0) {
      return;
    }

    const arg = args[0];

    if (this.isArrayLiteralExpression(arg)) {
      const elmts = arg.elements;
      for (const elmt of elmts) {
        if (this.isStringLiteral(elmt)) {
          await this.resolveAndRegister(elmt.text, fetch);
        }
      }
    }
  }

  private async resolveAndRegister(moduleUri: string, fetch: Resolve): Promise<void> {
    let content = await fetch(moduleUri);

    if (content && Content.isSourceContent(content)) {
      for (const res of content.resources) {
        this._globals.push(res);
      }
    }
  }

  private isStringLiteral(exp: ts.Expression): exp is ts.StringLiteral {
    return exp.kind === ts.SyntaxKind.StringLiteral;
  }

  private isExpressionStatement(exp: ts.Statement): exp is ts.ExpressionStatement {
    return exp.kind === ts.SyntaxKind.ExpressionStatement;
  }

  private isCallExpression(exp: ts.Expression): exp is ts.CallExpression {
    return exp.kind === ts.SyntaxKind.CallExpression;
  }

  private isArrayLiteralExpression(exp: ts.Expression): exp is ts.ArrayLiteralExpression {
    return exp.kind === ts.SyntaxKind.ArrayLiteralExpression;
  }

  private isPropertyAccessExpression(exp: ts.Expression): exp is ts.PropertyAccessExpression {
    return exp.kind === ts.SyntaxKind.PropertyAccessExpression;
  }

  private getExportedFunctions(source: ts.SourceFile): ts.FunctionDeclaration[] {
    return source.statements.filter(x => x.kind === ts.SyntaxKind.FunctionDeclaration && this.isNodeExported(x)).map(x => <ts.FunctionDeclaration>x);
  }

  private isNodeExported(node: ts.Node): boolean {
    return ((node.flags & ts.ModifierFlags.Export) !== 0) && (node.parent !== undefined && node.parent.kind === ts.SyntaxKind.SourceFile);
  }
}
