import { Linter, Rule, RuleError } from 'template-lint';
export declare class Config {
    obsoleteTags: Array<string>;
    obsoleteAttributes: Array<{
        name: string;
        tag: string;
    }>;
    voids: Array<string>;
    scopes: Array<string>;
    containers: Array<string>;
    customRules: Rule[];
}
export declare class AureliaLinter {
    linter: Linter;
    constructor(config?: Config);
    lint(html: string): Promise<RuleError[]>;
}
