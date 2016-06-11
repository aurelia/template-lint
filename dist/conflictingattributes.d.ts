import { Rule, ParseState } from 'template-lint';
import { SAXParser } from 'parse5';
export declare class ConflictingAttributes {
    attributeNames: string[];
    errMsgPrefix: string;
    constructor(attributeNames: string[], errMsgPrefix: string);
}
/**
 * Rule to ensure tags don't have attributes that shouldn't be used at the same time.
 */
export declare class ConflictingAttributesRule extends Rule {
    conflictingAttributesList: ConflictingAttributes[];
    static TEMPLATE_CONTROLLER_ATTRIBUTES_ERRMSG_PREFIX: string;
    static TEMPLATE_CONTROLLER_ATTRIBUTES_ERRMSG_DESCRIPTION: string;
    constructor(conflictingAttributesList?: ConflictingAttributes[]);
    static createDefaultConflictingAttributes(): ConflictingAttributes[];
    init(parser: SAXParser, parseState: ParseState): void;
    private checkConflictsWith(attrs, loc, conflictingAttributes);
}
