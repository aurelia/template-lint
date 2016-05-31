import { Rule, ParseState, RuleError } from 'template-lint';
import { SAXParser } from 'parse5';
/**
 *  Rule to ensure root element is the template element
 */
export declare class TemplateRule extends Rule {
    disable: boolean;
    first: boolean;
    count: number;
    init(parser: SAXParser, parseState: ParseState): void;
    finalise(): RuleError[];
}
