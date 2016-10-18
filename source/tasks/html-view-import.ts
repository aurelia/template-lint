import { FileTask } from '../file-task';
import { File, FileKind, FileLocation, FileImport } from '../file';
import { Fetch } from '../fetch';
import { Issue, IssueSeverity } from '../issue';
import { Options } from '../options';
import { ASTNode, ASTElementNode } from '../ast';
import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';

import _path = require('path');
import postix = _path.posix;

/**
 * Task for view-only imports
 */
export class HtmlViewImportTask implements FileTask {
  constructor(private opts: Options) {
  }

  async process(file: File, fetch: Fetch): Promise<boolean> {
    if (file.kind !== FileKind.Html)
      return false;

    const imports = file.imports;

    for (var importPath in imports) {
      const importEntry = imports[importPath];

      if (importEntry.file.kind == FileKind.Html) {

        if (this.opts["report-html-require-view-when-viewmodel-exists"]) {
          if (importEntry.file.path) {
            var viewModelPath = importEntry.file.path.replace(".html", `.${this.opts["source-ext"]}`);
            var viewModelFile = fetch(viewModelPath, { process: false });
            if (viewModelFile != undefined) {
              this.reportViewModelExists(file, importEntry.location);
            }
          }
        }
      }
    }
    return false;
  }

  private reportViewModelExists(file: File, loc: FileLocation) {
    file.issues.push({
      message: `imported view-only template when view-model exists`,
      severity: IssueSeverity.Warning,
      location: loc
    });
  }
}
