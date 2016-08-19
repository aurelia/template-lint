
"use strict";

import { Rule, Parser, Issue, IssueSeverity } from 'template-lint';


/**
 *  Rule to ensure require element is well formed
 */
export class RequireRule extends Rule {
  init(parser: Parser) {
    var self = this;

    parser.on('startTag', (name, attrs, selfClosing, location) => {

      if (name != 'require')
        return;

      let result = attrs.find(x => (<any>x).name == 'from');

      if (!result) {
        let error = new Issue({
          message: "require tag is missing a 'from' attribute",
          line: location.line,
          column: location.col
        });
        self.reportIssue(error);
      }
    });
  }
}
