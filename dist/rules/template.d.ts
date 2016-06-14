import { Rule, ParseState } from 'template-lint';
import { SAXParser } from 'parse5';
/**
 *  Rule to ensure root element is the template element
 */
export declare class TemplateRule extends Rule {
    containers: string[];
    disable: boolean;
    first: boolean;
    count: number;
    constructor(containers?: string[]);
    init(parser: SAXParser, parseState: ParseState): void;
}
