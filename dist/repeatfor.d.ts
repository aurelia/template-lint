import { Rule, ParseState } from 'template-lint';
import { SAXParser } from 'parse5';
/**
 * Rule to ensure tags are properly closed.
 */
export declare class RepeatForRule extends Rule {
    private: any;
    init(parser: SAXParser, parseState: ParseState): void;
}
