"use strict";

import { Rule } from 'template-lint';
import { Parser } from 'template-lint';
import { Issue, IssueSeverity } from 'template-lint';

/**
 * Rule to ensure elements have required attributes
 */
export class RequiredAttributeRule extends Rule {
  patterns: Array<{ tag: RegExp, attr: RegExp, msg: string }>;

  constructor(patterns?: Array<{ tag: RegExp, attr: RegExp, msg: string }>) {
    super();
    this.patterns = patterns ? patterns : [];
  }

  init(parser: Parser) {
    parser.on("startTag", (tag, attrs, selfClosing, loc) => {
      let rules = this.patterns.filter(r => {
        return r.tag.test(tag);
      });

      if (rules) {
        for (var rule of rules) {
          if (!attrs.find(x => rule.attr.test(x.name))) {
            let issue = new Issue({
              message: rule.msg,
              severity: IssueSeverity.Error,
              line: loc.line,
              column: loc.col,
              start: loc.startOffset,
              end: loc.endOffset
            });
            this.reportIssue(issue);
          }
        }
      }
    });
  }
};
