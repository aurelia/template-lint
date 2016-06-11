"use strict";

import {Rule, ParseState, RuleError} from 'template-lint';
import {SAXParser, Attribute, StartTagLocationInfo} from 'parse5';

export class ConflictingAttributes {
  constructor(public attributeNames: string[], public errMsgPrefix: string) {
  }
}

/**
 * Rule to ensure tags don't have attributes that shouldn't be used at the same time.
 */
export class ConflictingAttributesRule extends Rule {
  static TEMPLATE_CONTROLLER_ATTRIBUTES_ERRMSG_PREFIX = /*"template controllers shouldn't be placed to the same element, */ "conflicting attributes: ";
  static TEMPLATE_CONTROLLER_ATTRIBUTES_ERRMSG_DESCRIPTION = "template controllers shouldn't be placed to the same element";

  constructor(public conflictingAttributesList?: ConflictingAttributes[]) {
    super();
    if (!conflictingAttributesList) {
      this.conflictingAttributesList = ConflictingAttributesRule.createDefaultConflictingAttributes();
    } else if (conflictingAttributesList.length === 0) {
      throw new Error("Illegal argument: empty conflictingAttributesList");
    }
  }

  static createDefaultConflictingAttributes() {
    return [
      new ConflictingAttributes(["repeat.for", "if.bind", "with.bind"], ConflictingAttributesRule.TEMPLATE_CONTROLLER_ATTRIBUTES_ERRMSG_PREFIX),
    ];
  }

  init(parser: SAXParser, parseState: ParseState) {
    super.init(parser, parseState);
    parser.on("startTag", (tag, attrs, selfClosing, loc) => {
      this.conflictingAttributesList.forEach((conflictingAttributes) => {
        this.checkConflictsWith(attrs, loc, conflictingAttributes);
      });
    });
  }

  private checkConflictsWith(attrs: Attribute[], loc: StartTagLocationInfo, conflictingAttributes: ConflictingAttributes) {
    const attributes = [];
    attrs.forEach(attr => {
      if (conflictingAttributes.attributeNames.indexOf(attr.name) >= 0 ) {
        attributes.push(attr.name);
      }
    });
    if (attributes.length > 1) {
      const fullErrMsg = conflictingAttributes.errMsgPrefix + "[" + attributes.join(", ") + "]";
      this.reportError(new RuleError(fullErrMsg, loc.line, loc.col));
    }
  }

}
