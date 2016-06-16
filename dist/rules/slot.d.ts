import { Rule, ParseState, Issue } from 'template-lint';
import { SAXParser, StartTagLocationInfo } from 'parse5';
/**
 *  Rule to ensure root element is the template element
 */
export declare class SlotRule extends Rule {
    slots: Array<{
        name: string;
        loc: StartTagLocationInfo;
    }>;
    constructor();
    init(parser: SAXParser, parseState: ParseState): void;
    finalise(): Issue[];
}
