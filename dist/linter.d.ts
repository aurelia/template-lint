import { Linter as TemplateLinter, Rule, RuleError } from 'template-lint';
export declare class Config {
    obsoleteTags: Array<string>;
    obsoleteAttributes: Array<{
        name: string;
        tag: string;
    }>;
    voids: Array<string>;
    scopes: Array<string>;
    rules: Rule[];
    customRules: Rule[];
}
export declare class Linter {
    linter: TemplateLinter;
    constructor(config?: Config);
    lint(html: string): Promise<RuleError[]>;
}
