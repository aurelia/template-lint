import { Rule, ParseState } from 'template-lint';
import { SAXParser } from 'parse5';
/**
 *  Rule to ensure require element is well formed
 */
export declare class RequireRule extends Rule {
    init(parser: SAXParser, parseState: ParseState): void;
}
