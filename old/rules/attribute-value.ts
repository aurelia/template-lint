"use strict";

import { ParserTask } from '../parser-task';
import { Parser } from '../parser';
import { Issue, IssueSeverity } from '../issue';

/**
 * Rule to ensure attribute values match a pattern
 */
export class AttributeValueRule extends ParserTask {
  patterns: Array<{ attr: RegExp, is?: RegExp, not?: RegExp, msg?: string, tag?: string }>;

  constructor(patterns?: Array<{ attr: RegExp, is?: RegExp, not?: RegExp, msg?: string, tag?: string }>) {
    super();
    this.patterns = patterns ? patterns : [];
  }

  init(parser: Parser) {
    parser.on("startTag", (tag, attrs, selfClosing, loc) => {

      attrs.forEach(attr => {
        var pattern = this.patterns.find(x => {
          if (x.tag && x.tag != tag)
            return false;

          return matches != attr.name.match(x.attr);
        });

        if (pattern) {
          var matches;
          if (pattern.is != null) {
            matches = attr.value.match(pattern.is);
            if (matches == null || matches[0] != attr.value) {
              let issue = <Issue>{
                message: pattern.msg || `attribute value doesn't match expected pattern`,
                severity: IssueSeverity.Error,
                line: loc.line,
                column: loc.col,
                start: loc.startOffset,
                end: loc.endOffset
              };
              this.reportIssue(issue);
            }
          } else if (pattern.not != null) {
            matches = attr.value.match(pattern.not);
            if (matches != null) {
              let issue = <Issue>{
                message: pattern.msg || `attribute value matched a disallowed pattern`,
                severity: IssueSeverity.Error,
                line: loc.line,
                column: loc.col,
                start: loc.startOffset,
                end: loc.endOffset
              };
              this.reportIssue(issue);
            }
          } else /* no value expected */ {
            if (attr.value != "") {
              let issue = <Issue>{
                message: pattern.msg || `attribute should not have a value`,
                severity: IssueSeverity.Error,
                line: loc.line,
                column: loc.col,
                start: loc.startOffset,
                end: loc.endOffset
              };
              this.reportIssue(issue);
            }
          }
        }
      });
    });
  }
}
