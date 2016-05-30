import { Rule, ParseState } from 'template-lint';
import { SAXParser } from 'parse5';
/**
 *  Rule to ensure root element is the template element
 */
export declare class TemplateRule extends Rule {
    init(parser: SAXParser, parseState: ParseState): void;
}
