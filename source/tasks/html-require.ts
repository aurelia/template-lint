import { FileTask } from '../file-task';
import { File, FileKind, FileLocation } from '../file';
import { Fetch } from '../fetch';
import { Issue, IssueSeverity } from '../issue';
import { Options } from '../options';
import { ASTNode, ASTElementNode } from '../ast';
import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';

import { Path } from '../utils/safe-path';

/**
 * Check require elements and gather imported file
 */
export class HtmlRequireTask implements FileTask {
  constructor(private opts: Options) {
  }

  async process(file: File, fetch: Fetch): Promise<boolean> {
    if (file.kind !== FileKind.Html)
      return false;

    const ast: ASTNode = file["ast"];

    if (ast != null) {
      await ASTNode.descend(ast, async (node) => await this.visit(node, file, fetch));
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

      let requirePath = attr.value.replace(/\\/g, "/");

      // triage #134
      if (requirePath.indexOf("!") != -1) {
        return;
      }

      if (file.imports[requirePath] !== undefined) {
        this.reportDuplicate(file, attr.location);
        return;
      }

      let nodePath = (file.path || "").replace(/\\/g, "/");
      let importPath = Path.normalize(Path.join(Path.dirname(nodePath), requirePath));

      if (Path.extname(importPath) === "") {
        importPath += "." + this.opts["source-ext"];
      }

      let importFile = await fetch(importPath);

      if (importFile === undefined) {
        if (this.opts["report-html-require-not-found"])
          this.reportNotFound(file, requirePath, attr.location);
        return;
      }

      file.imports[requirePath] = { file: importFile, location: node.location };
    }
  }

  private reportDuplicate(file: File, loc: FileLocation) {
    file.issues.push({
      message: "duplicate require ",
      severity: IssueSeverity.Info,
      location: loc
    });
  }

  private reportMissingFrom(file: File, loc: FileLocation) {
    file.issues.push({
      message: "missing a 'from' attribute",
      severity: IssueSeverity.Error,
      location: loc
    });
  }

  private reportEmptyFrom(file: File, loc: FileLocation) {
    file.issues.push({
      message: "'from' cannot be empty",
      severity: IssueSeverity.Error,
      location: loc
    });
  }

  private reportNotFound(file: File, path: string, loc: FileLocation) {
    file.issues.push({
      message: `cannot find ${path}`,
      severity: IssueSeverity.Error,
      location: loc
    });
  }
}
