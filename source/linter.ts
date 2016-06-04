import {Linter as TemplateLinter, Rule, RuleError} from 'template-lint';

import {SelfCloseRule} from 'template-lint';
import {ParserRule} from 'template-lint';
import {ObsoleteTagRule} from 'template-lint';
import {ObsoleteAttributeRule} from 'template-lint';

import {RequireRule} from './require';
import {SlotRule} from './slot';
import {TemplateRule} from './template';

export class Config {
    obsoleteTags: Array<string> = ['content'];
    obsoleteAttributes: Array<{ name: string, tag: string }> = [];
    voids: Array<string> = ['area', 'base', 'br', 'col', 'embed', 'hr',
        'img', 'input', 'keygen', 'link', 'meta',
        'param', 'source', 'track', 'wbr'];
    scopes: Array<string> = ['html', 'body', 'template', 'svg', 'math'];
    rules: Rule[] = null;
    customRules: Rule[] = [];
}

export class Linter {
    linter: TemplateLinter;

    constructor(config?: Config) {

        if (config == undefined)
            config = new Config();
            
        let rules = config.rules || [
            new SelfCloseRule(),
            new ParserRule(),
            new ObsoleteAttributeRule(config.obsoleteAttributes),
            new ObsoleteTagRule(config.obsoleteTags),

            new RequireRule(),
            new SlotRule(),
            new TemplateRule()
        ].concat(config.customRules);

        this.linter = new TemplateLinter(
            rules,
            config.scopes,
            config.voids);
    }

    public lint(html: string): Promise<RuleError[]> {
        return this.linter.lint(html);
    }
}