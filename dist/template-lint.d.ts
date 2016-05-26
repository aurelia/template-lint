import { SAXParser, ASTNode } from 'parse5';
/**
* Abstract Lint Rule
*/
export declare abstract class Rule {
    name: string;
    description: string;
    abstract init(parse: SAXParser, root: ASTNode): any;
    abstract lint(completed: Promise<void>): Promise<void>;
}
/**
 * Lint Rule to ensure non-void elements do not self-close
 */
export declare class SelfCloseRule extends Rule {
    private parser;
    result: boolean;
    init(parser: SAXParser, root: ASTNode): void;
    lint(completed: Promise<void>): Promise<void>;
}
export declare class Linter {
    private rules;
    constructor();
    lint(html: string): Promise<boolean>;
}
