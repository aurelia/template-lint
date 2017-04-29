import { Content, ContentLocation, ContentContext } from '../content';
import { IssueSeverity } from '../issue';
import { ASTNode, ASTElementNode } from '../ast';
import { Path } from '../utils/safe-path';

/**
 * Check require elements and gather imported file
 */
export class HtmlRequireTask {
  async process(ctx: ContentContext): Promise<void> {

    if (!Content.isHtmlContent(ctx.content)) {
      return;
    }

    if (ctx.content.ast !== undefined) {
      await ASTNode.descend(ctx.content.ast, async (node) => await this.visit(node, ctx));
    }
  }

  private async visit(node: ASTNode, ctx: ContentContext): Promise<boolean> {

    if (node instanceof ASTElementNode && node.name === "require") {

      let attr = node.attrs.find(x => x.name === "from");

      if (!attr) {
        this.reportMissingFrom(ctx, node.location);
        return false;
      }

      if (!attr.value || attr.value.trim() === "") {
        this.reportEmptyFrom(ctx, attr.location);
        return false;
      }

      let requirePath = attr.value.replace(/\\/g, "/");

      // triage #134
      if (requirePath.indexOf("!") !== -1) {
        return false;
      }

      if (ctx.content.imports !== undefined && ctx.content.imports[requirePath] !== undefined) {
        this.reportDuplicate(ctx, attr.location);
        return false;
      }

      ctx.content.imports = ctx.content.imports || [];

      let nodePath = (ctx.content.path || "").replace(/\\/g, "/");
      let importPath = Path.normalize(Path.join(Path.dirname(nodePath), requirePath));

      let importFile = await ctx.resolve(importPath);

      if (importFile === undefined) {
        this.reportNotFound(ctx, requirePath, attr.location);
        return false;
      }

      ctx.content.imports[importPath] = { file: importFile, location: node.location };
    }

    return true;
  }

  private reportDuplicate(ctx: ContentContext, loc: ContentLocation): void {
    ctx.issues.push({
      message: "duplicate require",
      severity: IssueSeverity.Info,
      location: loc
    });
  }

  private reportMissingFrom(ctx: ContentContext, loc: ContentLocation): void {
    ctx.issues.push({
      message: "missing a 'from' attribute",
      severity: IssueSeverity.Error,
      location: loc
    });
  }

  private reportEmptyFrom(ctx: ContentContext, loc: ContentLocation): void {
    ctx.issues.push({
      message: "'from' cannot be empty",
      severity: IssueSeverity.Error,
      location: loc
    });
  }

  private reportNotFound(ctx: ContentContext, path: string, loc: ContentLocation): void {
    if (!ctx.options["report-html-require-not-found"]) {
      return;
    }

    ctx.issues.push({
      message: `cannot find ${path}`,
      severity: IssueSeverity.Error,
      location: loc
    });
  }
}
