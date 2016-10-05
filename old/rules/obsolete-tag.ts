"use strict";

import { ParserTask } from '../parser-task';
import { Parser } from '../parser';
import { Issue, IssueSeverity } from '../issue';

/**
 * Rule to ensure tags are properly closed. 
 */
export class ObsoleteTagRule extends ParserTask {

  obsoletes: Array<{ tag: string, msg?: string }>;

  constructor(obsolete?: Array<{ tag: string, msg?: string }>) {
    super();

    this.obsoletes = obsolete ? obsolete : [];
  }

  init(parser: Parser) {
    parser.on("startTag", (tag, attrs, selfClosing, loc) => {
      var obsolete = this.obsoletes.find(x => x.tag == tag);
      if (obsolete) {
        let issue = <Issue>{
          message: `<${tag}> is obsolete`,
          severity: IssueSeverity.Error,
          line: loc.line,
          column: loc.col,
          detail: obsolete.msg || "",
          start: loc.startOffset,
          end: loc.endOffset
        };
        this.reportIssue(issue);
      }
    });
  }
}
