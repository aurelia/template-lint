import { SAXParser } from 'parse5';
/**
* Abstract Lint Rule
*/
export declare abstract class Rule {
    name: string;
    description: string;
    errors: string[];
    abstract init(parser: SAXParser): any;
}
/**
 * Rule to ensure non-void elements do not self-close
 */
export declare class SelfCloseRule extends Rule {
    name: string;
    description: string;
    errors: string[];
    init(parser: SAXParser): void;
}
/**
 *  Rule to ensure root element is the template element
 */
export declare class TemplateRule extends Rule {
    name: string;
    description: string;
    errors: string[];
    init(parser: SAXParser): void;
}
/**
 *  Rule to ensure root element is the template element
 */
export declare class RouterRule extends Rule {
    name: string;
    description: string;
    errors: string[];
    init(parser: SAXParser): void;
}
/**
 *  Rule to ensure require element is well formed
 */
export declare class RequireRule extends Rule {
    name: string;
    description: string;
    errors: string[];
    init(parser: SAXParser): void;
}
export declare class Linter {
    private rules;
    constructor(rules?: Rule[]);
    lint(html: string): Promise<string[]>;
}
