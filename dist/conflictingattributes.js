"use strict";
const template_lint_1 = require('template-lint');
class ConflictingAttributes {
    constructor(attributeNames, errMsgPrefix) {
        this.attributeNames = attributeNames;
        this.errMsgPrefix = errMsgPrefix;
    }
}
exports.ConflictingAttributes = ConflictingAttributes;
/**
 * Rule to ensure tags don't have attributes that shouldn't be used at the same time.
 */
class ConflictingAttributesRule extends template_lint_1.Rule {
    constructor(conflictingAttributesList) {
        super();
        this.conflictingAttributesList = conflictingAttributesList;
        if (!conflictingAttributesList) {
            this.conflictingAttributesList = ConflictingAttributesRule.createDefaultConflictingAttributes();
        }
        else if (conflictingAttributesList.length === 0) {
            throw new Error("Illegal argument: empty conflictingAttributesList");
        }
    }
    static createDefaultConflictingAttributes() {
        return [
            new ConflictingAttributes(["repeat.for", "if.bind", "with.bind"], ConflictingAttributesRule.TEMPLATE_CONTROLLER_ATTRIBUTES_ERRMSG_PREFIX),
        ];
    }
    init(parser, parseState) {
        super.init(parser, parseState);
        parser.on("startTag", (tag, attrs, selfClosing, loc) => {
            this.conflictingAttributesList.forEach((conflictingAttributes) => {
                this.checkConflictsWith(attrs, loc, conflictingAttributes);
            });
        });
    }
    checkConflictsWith(attrs, loc, conflictingAttributes) {
        const attributes = [];
        attrs.forEach(attr => {
            if (conflictingAttributes.attributeNames.indexOf(attr.name) >= 0) {
                attributes.push(attr.name);
            }
        });
        if (attributes.length > 1) {
            const fullErrMsg = conflictingAttributes.errMsgPrefix + "[" + attributes.join(", ") + "]";
            this.reportError(new template_lint_1.RuleError(fullErrMsg, loc.line, loc.col));
        }
    }
}
ConflictingAttributesRule.TEMPLATE_CONTROLLER_ATTRIBUTES_ERRMSG_PREFIX = "conflicting attributes: ";
ConflictingAttributesRule.TEMPLATE_CONTROLLER_ATTRIBUTES_ERRMSG_DESCRIPTION = "template controllers shouldn't be placed to the same element";
exports.ConflictingAttributesRule = ConflictingAttributesRule;

//# sourceMappingURL=conflictingattributes.js.map
