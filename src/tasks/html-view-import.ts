import { ContentContext } from '../context';
import { Content, ContentKind, ContentLocation, ContentImport } from '../content';
import { Fetch } from '../fetch';
import { Issue, IssueSeverity } from '../issue';
import { Options } from '../options';
import { ASTNode, ASTElementNode } from '../ast';
import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';

/**
 * Task for view-only imports
 */
export class HtmlViewImportTask {
  async process(ctx: ContentContext) {

    if (!Content.isHtmlContent(ctx.content))
      return;

    const imports = ctx.content.imports;

    if (imports == undefined)
      return;

    for (var importPath in imports) {
      const importEntry = imports[importPath];

      if (importEntry.content.kind == ContentKind.Html) {
        if (importEntry.content.path) {
          var viewModelPath = importEntry.content.path.replace(".html", `.${ctx.options["source-ext"]}`);
          var viewModelFile = ctx.fetch(viewModelPath, { process: false });
          if (viewModelFile != undefined) {
            this.reportViewModelExists(ctx, importEntry.location);
          }
        }
      }
    }
  }

  private reportViewModelExists(ctx: ContentContext, loc: ContentLocation) {
    if (ctx.options["report-html-require-view-when-viewmodel-exists"])
      ctx.issues.push({
        message: `imported view-only template when view-model exists`,
        severity: IssueSeverity.Warning,
        location: loc
      });
  }
}
