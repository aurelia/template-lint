import { Options } from '../../../options';
import { File, FileLocation } from '../../../file';
import { Issue, IssueSeverity } from '../../../issue';

import { ParserHook } from '../parser-hook';
import { Parser } from '../parser';

export class ObsoleteHook extends ParserHook {

  constructor(private opts: Options) { super(); }

  protected hook() {
    this.parser.on('startTag', (elmt, attrs, selfClosing, loc) => {

      this.checkElement(elmt, new FileLocation({
        line: loc!.line,
        column: loc!.col,
        start: loc!.startOffset,
        end: loc!.endOffset
      }));

      for (var attr of attrs) {

        const prefixed = (
          (attr.prefix && attr.prefix != "") &&
          (attr.name && attr.name != "")
        ) ? ":" : "";

        const attrName = `${attr.prefix || ""}${prefixed}${attr.name || ""}`;

        const attrLoc = loc!.attrs[attrName];

        this.checkAttribute(attrName, elmt, new FileLocation({
          line: attrLoc!.line,
          column: attrLoc!.col,
          start: attrLoc!.startOffset,
          end: attrLoc!.endOffset
        }));
      }
    });
  }

  finalise() { }

  private checkElement(name: string, location: FileLocation) {
    const obsoletes = this.opts["obsolete-elements"];
    const obsoleteIndex = obsoletes.findIndex((x) => x.elmt == name);

    if (obsoleteIndex >= 0) {

      var entry = obsoletes[obsoleteIndex];
      this.reportElementObsolete(name, entry.msg, location);
    }
  }

  private checkAttribute(name: string, elmt: string, location: FileLocation) {
    const obsoletes = this.opts["obsolete-attributes"];
    const obsoleteIndex = obsoletes.findIndex((x) => x.attr == name);

    if (obsoleteIndex >= 0) {
      var entry = obsoletes[obsoleteIndex];

      if (entry.elmt && entry.elmt != elmt)
        return;

      this.reportAttributeObsolete(name, entry.msg, location);
    }
  }

  private reportElementObsolete(elmt: string, detail: string | undefined, location: FileLocation) {

    let issue = new Issue({
      message: `${elmt} element is obsolete`,
      severity: IssueSeverity.Warning,
      detail: detail,
      location: location
    });
    
    this.reportIssue(issue);
  }

  private reportAttributeObsolete(attr: string, detail: string | undefined, location: FileLocation) {

    let issue = new Issue({
      message: `${attr} attribute is obsolete`,
      severity: IssueSeverity.Warning,
      detail: detail,
      location: location
    });

    this.reportIssue(issue);
  }
}
