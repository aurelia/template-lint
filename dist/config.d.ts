import { Rule } from 'template-lint';
export declare class Config {
    attributeValueRules: Array<{
        attr: RegExp;
        is?: RegExp;
        not?: RegExp;
        msg?: string;
        tag?: string;
    }>;
    obsoleteTags: Array<{
        tag: string;
        msg?: string;
    }>;
    obsoleteAttributes: Array<{
        attr: string;
        tag?: string;
        msg?: string;
    }>;
    conflictingAttributes: Array<{
        attrs: string[];
        msg?: string;
    }>;
    templateControllers: string[];
    voids: Array<string>;
    scopes: Array<string>;
    containers: Array<string>;
    customRules: Rule[];
}
