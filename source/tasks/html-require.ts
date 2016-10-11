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

    if (ast == null)
      return false;

    const elements = <ASTElementNode[]>ast.children.filter(x => x instanceof (ASTElementNode));
    const requires = elements.filter(x => x.name == "require");

    for (let elmt of requires) {
      let attr = elmt.attrs.find(x => x.name == "from");

      if (!attr) {
        this.reportMissingFrom(file, elmt.location);
        continue;
      }

      if (!attr.value || attr.value.trim() == "") {
        this.reportEmptyFrom(file);
        continue;
      }

      let importPath = attr.value;

      if (file.imports[importPath] !== undefined)
        throw Error("cyclic loop?");

      let importFile = await fetch(importPath);

      if (importFile === undefined) {
        this.reportNotFound(file, importPath, attr.location);
        continue;
      }

      file.imports[importPath] = importFile;
    }

    return false;
  }

  private reportMissingFrom(file: File, loc?: ASTLocation | null) {
    file.issues.push({
      message: "<require> must have a 'from' attribute",
      severity: IssueSeverity.Error,
      line: loc!.line,
      column: loc!.column,
      start: loc!.start,
      end: loc!.end
    });
  }

  private reportEmptyFrom(file: File, loc?: ASTLocation | null) {
    file.issues.push({
      message: "'from' value cannot be empty",
      severity: IssueSeverity.Error,
      line: loc!.line,
      column: loc!.column,
      start: loc!.start,
      end: loc!.end
    });
  }

  private reportNotFound(file: File, path: string, loc?: ASTLocation | null) {
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
