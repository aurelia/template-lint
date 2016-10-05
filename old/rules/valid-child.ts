"use strict";

import { Rule } from '../rule';
import { Parser } from '../parser';
import { Issue, IssueSeverity } from '../issue';

export class ValidChildRule extends Rule {
  constructor(public rules: { element: string, allow?: string[], exclude?: string[] }[]) {
    super();
  }

  init(parser: Parser) {
    if (!this.rules)
      return;

    parser.on('startTag', (name, attrs, selfClosing, loc) => {

      if (parser.state.stack.length <= 1)
        return;

      var stack = parser.state.stack;
      var parent = stack[stack.length - 1];
      var rule = this.rules.find(x => x.element == parent.name);

      if (!rule)
        return;

      if (rule.exclude) {
        if (rule.exclude.findIndex(x => x == name) != -1) {
          this.reportIssue(new Issue({
            message: `<${name}> as child of <${rule.element}> is not allowed`,
            severity: IssueSeverity.Error,
            line: loc.line,
            column: loc.col,
            start: loc.startOffset,
            end: loc.endOffset
          }));
        }
      }
      else if (rule.allow) {
        if (rule.allow.findIndex(x => x == name) == -1) {
          this.reportIssue(new Issue({
            message: `<${name}> as child of <${rule.element}> is not allowed`,
            severity: IssueSeverity.Error,
            line: loc.line,
            column: loc.col,
            start: loc.startOffset,
            end: loc.endOffset
          }));
        }
      }
    });
  }
}
