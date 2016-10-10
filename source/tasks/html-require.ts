import { FileTask } from '../file-task';
import { File, FileKind } from '../file';
import { Issue, IssueSeverity } from '../issue';
import { Options } from '../options';
import { ASTNode, ASTElementNode } from '../ast';

import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';

/**
 * Check require elements and gather resources
 */
export class HtmlRequireTask implements FileTask {
  constructor(private opts: Options) { }

  async process(file: File): Promise<boolean> {
    if (file.kind !== FileKind.Html)
      return false;

    const ast: ASTNode = file["ast"];

    if (ast == null)
      return false;

    const elements = <ASTElementNode[]>ast.children.filter(x => x instanceof (ASTElementNode));
    const requires = elements.filter(x => x.name == "require");

    for (let req of requires) {
      let attrFrom = req.attrs.find(x => x.name == "from");
      if (!attrFrom) {
        file.issues.push({
          message: "require must have a 'from' attribute",
          severity: IssueSeverity.Error,
          line: req.location!.line,
          column: req.location!.column,
          start: req.location!.start,
          end: req.location!.end
        });
      }
      else
      {
        file.imports[attrFrom.value] = true;
      }
    }

    return false;
  }
}
