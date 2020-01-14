
"use strict";

import { Rule, Parser, Issue } from 'template-lint';

/**
 *  Rule to ensure require element is well formed
 */
export class RequireRule extends Rule {
  init(parser: Parser) {
    var self = this;

    parser.on('startTag', (name, attrs, _, location) => {

      if (name != 'require')
        return;

      let result = attrs.find(x => x.name === 'from' || x.name === 'from.bind');

      if (!result) {
        let error = new Issue({
          message: "require tag is missing a 'from' of 'from.bind' attribute",
          line: location.line,
          column: location.col
        });
        self.reportIssue(error);
      }
    });
  }
}
