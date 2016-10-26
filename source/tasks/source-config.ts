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
import { ResourceCollection } from '../resource-collection';

import * as ts from 'typescript';

/** Analyse Exported Config Method */
export class SourceConfigTask implements FileTask {
  constructor(private opts: Options, private globalResources: ResourceCollection) { }

  async process(file: File, fetch: Fetch): Promise<boolean> {
    if (this.isSourceFile(file)) {

      // export function config($param)
        // where $param.use is main entry configuration
        // where $param.globalResources is feature configuration
      
    }
    return false;
  }

  private isSourceFile(file: IFile): file is ISourceFile {
    return file.kind === FileKind.Source;
  }

  private isCallExpression(node: ts.Node): node is ts.CallExpression {
    return node.kind == ts.SyntaxKind.CallExpression;
  }

  private getExportedClasses(source: ts.SourceFile) {
    return source.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration && this.isNodeExported(x)).map(x => <ts.ClassDeclaration>x);
  }

  private isNodeExported(node: ts.Node): boolean {
    return ((node.flags & ts.NodeFlags.Export) !== 0) && (node.parent != null && node.parent.kind === ts.SyntaxKind.SourceFile);
  }
}
