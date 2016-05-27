import { SAXParser, StartTagLocationInfo } from 'parse5';
/**
* Abstract Lint Rule
*/
export declare abstract class Rule {
    name: string;
    description: string;
    errors: string[];
    abstract init(parser: SAXParser, parseState: ParseState): any;
    finalise(): void;
}
/**
 * Rule to ensure non-void elements do not self-close
 */
export declare class SelfCloseRule extends Rule {
    name: string;
    description: string;
    errors: string[];
    init(parser: SAXParser, parseState: ParseState): void;
}
/**
 *  Rule to ensure root element is the template element
 */
export declare class TemplateRule extends Rule {
    name: string;
    description: string;
    errors: string[];
    init(parser: SAXParser, parseState: ParseState): void;
}
/**
 *  Rule to ensure root element is the template element
 */
export declare class RouterRule extends Rule {
    name: string;
    description: string;
    errors: string[];
    init(parser: SAXParser, parseState: ParseState): void;
}
/**
 *  Rule to ensure require element is well formed
 */
export declare class RequireRule extends Rule {
    name: string;
    description: string;
    errors: string[];
    init(parser: SAXParser, parseState: ParseState): void;
}
export declare class WellFormedRule extends Rule {
    name: string;
    description: string;
    errors: string[];
    private parseState;
    init(parser: SAXParser, parseState: ParseState): void;
    finalise(): void;
}
export declare class ParseNode {
    scope: string;
    name: string;
    location: StartTagLocationInfo;
    constructor(scope: string, name: string, location: StartTagLocationInfo);
}
/**
 *  Helper to maintain the current state of traversal.
 */
export declare class ParseState {
    stack: ParseNode[];
    errors: string[];
    scopes: string[];
    private illFormed;
    constructor(scopes?: string[]);
    init(parser: SAXParser): void;
    finalise(): void;
    private isVoid(name);
    private isScope(name);
}
export declare class Linter {
    private rules;
    constructor(rules?: Rule[]);
    lint(html: string): Promise<string[]>;
}
