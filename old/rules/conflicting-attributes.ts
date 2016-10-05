"use strict";

import { ParserTask } from '../parser-task';
import { Parser } from '../parser';
import { Issue, IssueSeverity } from '../issue';
import { ASTAttribute, StartTagLocationInfo } from 'parse5';

export class ConflictingAttributes {
  constructor(public attrs: string[], public msg: string) {
  }
}

/**
 * Rule to ensure tags don't have attributes that shouldn't be used at the same time.
 */
export class ConflictingAttributesRule extends ParserTask {
  static ERRMSG_PREFIX = "conflicting attributes: ";

  constructor(public conflictingAttributesList?: ConflictingAttributes[]) {
    super();
    if (!conflictingAttributesList) {
      this.conflictingAttributesList = [];
    } else if (conflictingAttributesList.length === 0) {
      throw new Error("Illegal argument: empty conflictingAttributesList");
    }
  }

  init(parser: Parser) {
    if (this.conflictingAttributesList.length === 0)
      return;
    parser.on("startTag", (tag, attrs, selfClosing, loc) => {
      this.conflictingAttributesList.forEach((conflictingAttributes) => {
        this.checkConflictsWith(attrs, loc, conflictingAttributes);
      });
    });
  }

  private checkConflictsWith(attrs: ASTAttribute[], loc: StartTagLocationInfo, conflictingAttributes: ConflictingAttributes) {
    const attributes = [];
    attrs.forEach(attr => {
      if (conflictingAttributes.attrs.indexOf(attr.name) >= 0) {
        attributes.push(attr.name);
      }
    });
    if (attributes.length > 1) {
      const fullErrMsg = ConflictingAttributesRule.ERRMSG_PREFIX + "[" + attributes.join(", ") + "]";
      this.reportIssue(<Issue>{
        message: fullErrMsg,
        severity: IssueSeverity.Error,
        line: loc.line,
        column: loc.col,
        detail: conflictingAttributes.msg,
        start: loc.startOffset,
        end: loc.endOffset
      });
    }
  }
}
