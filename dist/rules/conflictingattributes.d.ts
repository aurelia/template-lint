import { Rule, ParseState } from 'template-lint';
import { SAXParser } from 'parse5';
export declare class ConflictingAttributes {
    attrs: string[];
    msg: string;
    constructor(attrs: string[], msg: string);
}
/**
 * Rule to ensure tags don't have attributes that shouldn't be used at the same time.
 */
export declare class ConflictingAttributesRule extends Rule {
    conflictingAttributesList: ConflictingAttributes[];
    static ERRMSG_PREFIX: string;
    constructor(conflictingAttributesList?: ConflictingAttributes[]);
    static createDefaultConflictingAttributes(): ConflictingAttributes[];
    init(parser: SAXParser, parseState: ParseState): void;
    private checkConflictsWith(attrs, loc, conflictingAttributes);
}
