"use strict";

import { ParserTask } from '../parser-task';
import { Parser } from '../parser';
import { Issue, IssueSeverity } from '../issue';

/**
 * Rule to ensure non-void elements do not self-close
 */
export class SelfCloseRule extends ParserTask {
  init(parser: Parser) {
    parser.on('startTag', (name, attrs, selfClosing, loc) => {

      let scope = parser.state.scope;

      if (scope == 'svg' || scope == 'math') {
        return;
      }

      if (selfClosing && parser.state.isVoid(name) == false) {

        let issue = <Issue>{
          message: "self-closing element",
          severity: IssueSeverity.Error,
          line: loc.line,
          column: loc.col,
          start: loc.startOffset,
          end: loc.endOffset
        };
        this.reportIssue(issue);
      }
    });
  }
}
