import { Options } from '../../../options';
import { Content, ContentLocation } from '../../../content';
import { Issue, IssueSeverity } from '../../../issue';

import { ParserHook } from '../parser-hook';
import { Parser } from '../parser';

export class ObsoleteHook extends ParserHook {

  protected hook() {
    this.parser.on('startTag', (elmt, attrs, selfClosing, loc) => {

      this.checkElement(elmt, {
        line: loc!.line,
        column: loc!.col,
        start: loc!.startOffset,
        end: loc!.endOffset
      });

      for (var attr of attrs) {

        const prefixed = (
          (attr.prefix && attr.prefix != "") &&
          (attr.name && attr.name != "")
        ) ? ":" : "";

        const attrName = `${attr.prefix || ""}${prefixed}${attr.name || ""}`;

        const attrLoc = loc!.attrs[attrName];

        this.checkAttribute(attrName, elmt, {
          line: attrLoc!.line,
          column: attrLoc!.col,
          start: attrLoc!.startOffset,
          end: attrLoc!.endOffset
        });
      }
    });
  }

  finalise() { }

  private checkElement(name: string, location: ContentLocation) {
    const obsoletes = this.context.options["obsolete-elements"];
    const obsoleteIndex = obsoletes.findIndex((x) => x.elmt == name);

    if (obsoleteIndex >= 0) {

      var entry = obsoletes[obsoleteIndex];
      this.reportElementObsolete(name, entry.msg, location);
    }
  }

  private checkAttribute(name: string, elmt: string, location: ContentLocation) {
    const obsoletes = this.context.options["obsolete-attributes"];
    const obsoleteIndex = obsoletes.findIndex((x) => x.attr == name);

    if (obsoleteIndex >= 0) {
      var entry = obsoletes[obsoleteIndex];

      if (entry.elmt && entry.elmt != elmt)
        return;

      this.reportAttributeObsolete(name, entry.msg, location);
    }
  }

  private reportElementObsolete(elmt: string, detail: string | undefined, location: ContentLocation) {

    let issue: Issue = {
      message: `${elmt} element is obsolete`,
      severity: IssueSeverity.Warning,
      detail: detail,
      location: location
    };

    this.reportIssue(issue);
  }

  private reportAttributeObsolete(attr: string, detail: string | undefined, location: ContentLocation) {

    let issue: Issue = {
      message: `${attr} attribute is obsolete`,
      severity: IssueSeverity.Warning,
      detail: detail,
      location: location
    };

    this.reportIssue(issue);
  }
}
