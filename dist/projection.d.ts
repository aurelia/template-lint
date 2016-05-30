import { Rule, ParseState } from 'template-lint';
import { SAXParser } from 'parse5';
/**
 *  Rule to ensure root element is the template element
 */
export declare class ProjectionRule extends Rule {
    private projTags;
    constructor(projTags?: string[]);
    init(parser: SAXParser, parseState: ParseState): void;
    private parentIsTag(tags, parseState);
}
