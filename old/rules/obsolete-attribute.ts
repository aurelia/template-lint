"use strict";

import { ParserTask } from '../parser-task';
import { Parser } from '../parser';
import { Issue, IssueSeverity } from '../issue';

/**
 * Rule to ensure tags are properly closed. 
 */
export class ObsoleteAttributeRule extends ParserTask {
  private obsoletes: Array<{ attr: string, tag?: string, msg?: string }>;

  constructor(obsolete?: Array<{ attr: string, tag?: string, msg?: string }>) {
    super();

    this.obsoletes = obsolete;
  }

  init(parser: Parser) {

    parser.on("startTag", (tag, attrs, selfClosing, loc) => {
      attrs.forEach(attr => {
        var obsoleteIndex = this.obsoletes.findIndex((x) => x.attr == attr.name);
        if (obsoleteIndex >= 0) {
          var entry = this.obsoletes[obsoleteIndex];

          if (entry.tag == null || entry.tag == "" || entry.tag == tag) {
            let issue = <Issue>{
              message: `${entry.attr} attribute is obsolete`,
              severity: IssueSeverity.Error,
              line: loc.line,
              column: loc.col,
              detail: entry.msg,
              start: loc.startOffset,
              end: loc.endOffset
            };
            this.reportIssue(issue);
          }
        }
      });
    });
  }
}
