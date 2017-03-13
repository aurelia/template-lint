import { ContentContext } from '../context';
import { Content, ContentKind, ContentLocation } from '../content';
import { IssueSeverity } from '../issue';

/**
 * Task for view-only imports
 */
export class HtmlViewImportTask {
  async process(ctx: ContentContext): Promise<void> {

    if (!Content.isHtmlContent(ctx.content)) {
      return;
    }

    const imports = ctx.content.imports;

    if (imports === undefined) {
      return;
    }

    for (const importPath in imports) {
      const importEntry = imports[importPath];

      if (importEntry.content.kind === ContentKind.Html) {
        if (importEntry.content.path) {
          const viewModelPath = importEntry.content.path.replace(".html", `.${ctx.options["source-ext"]}`);
          const viewModelFile = ctx.resolve(viewModelPath, { process: false });
          if (viewModelFile !== undefined) {
            this.reportViewModelExists(ctx, importEntry.location);
          }
        }
      }
    }
  }

  private reportViewModelExists(ctx: ContentContext, loc: ContentLocation): void {
    if (ctx.options["report-html-require-view-when-viewmodel-exists"]) {
      ctx.issues.push({
        message: `imported view-only template when view-model exists`,
        severity: IssueSeverity.Warning,
        location: loc
      });
    }
  }
}
