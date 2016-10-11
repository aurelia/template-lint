import { FileTask } from '../file-task';
import { File, FileKind } from '../file';
import { Fetch } from '../fetch';
import { Issue, IssueSeverity } from '../issue';
import { Options } from '../options';
import { ASTNode, ASTElementNode, ASTLocation } from '../ast';
import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';

/**
 * Check require elements and gather resources
 */
export class HtmlRequireTask implements FileTask {
  constructor(private opts: Options) { }

  async process(file: File, fetch: Fetch): Promise<boolean> {
    if (file.kind !== FileKind.Html)
      return false;

    const ast: ASTNode = file["ast"];

    if (ast != null) {
      await ASTNode.traverse(ast, async (node) => await this.visit(node, file, fetch));
    }

    return false;
  }

  private async visit(node: ASTNode, file: File, fetch: Fetch): Promise<void> {

    if (node instanceof ASTElementNode && node.name == "require") {
      
      let attr = node.attrs.find(x => x.name == "from");

      if (!attr) {
        this.reportMissingFrom(file, node.location);
        return;
      }

      if (!attr.value || attr.value.trim() == "") {
        this.reportEmptyFrom(file, attr.location);
        return;
      }

      let importPath = attr.value;

      if (file.imports[importPath] !== undefined)
        throw Error("cyclic loop?");

      let importFile = await fetch(importPath);

      if (importFile === undefined) {
        this.reportNotFound(file, importPath, attr.location);
        return;
      }

      file.imports[importPath] = importFile;
    }
  }

  private reportMissingFrom(file: File, loc: ASTLocation | null) {
    file.issues.push({
      message: "missing a 'from' attribute",
      severity: IssueSeverity.Error,
      line: loc!.line,
      column: loc!.column,
      start: loc!.start,
      end: loc!.end
    });
  }

  private reportEmptyFrom(file: File, loc: ASTLocation | null) {
    file.issues.push({
      message: "'from' cannot be empty",
      severity: IssueSeverity.Error,
      line: loc!.line,
      column: loc!.column,
      start: loc!.start,
      end: loc!.end
    });
  }

  private reportNotFound(file: File, path: string, loc: ASTLocation | null) {
    file.issues.push({
      message: `cannot find ${path}`,
      severity: IssueSeverity.Error,
      line: loc!.line,
      column: loc!.column,
      start: loc!.start,
      end: loc!.end
    });
  }
}
