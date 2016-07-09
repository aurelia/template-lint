import {Linter, Rule, Issue, IssueSeverity} from 'template-lint';

import {SelfCloseRule} from 'template-lint';
import {StructureRule} from 'template-lint';
import {ObsoleteTagRule} from 'template-lint';
import {ObsoleteAttributeRule} from 'template-lint';
import {UniqueIdRule} from 'template-lint';
import {AttributeValueRule} from 'template-lint';
import {ConflictingAttributesRule, ConflictingAttributes} from 'template-lint';

import {RequireRule} from './rules/require';
import {SlotRule} from './rules/slot';
import {TemplateRule} from './rules/template';
import {SyntaxRule} from './rules/syntax';

import {Reflection} from './reflection';
import {Config} from './config';

import {initialize} from 'aurelia-pal-nodejs';

initialize();

export class AureliaLinter {
    linter: Linter;
    reflection: Reflection;
    config: Config;

    private init: Promise<void>;

    constructor(config?: Config) {

        if (config == undefined)
            config = new Config();

        this.config = config;
        this.reflection = new Reflection();

        let rules = [
            new SelfCloseRule(),
            new StructureRule(),
            new ObsoleteAttributeRule(config.obsoleteAttributes),
            new ObsoleteTagRule(config.obsoleteTags),
            new AttributeValueRule(config.attributeValueRules),

            new RequireRule(),
            new SlotRule(config.templateControllers),
            new TemplateRule(config.containers),
            new ConflictingAttributesRule(<ConflictingAttributes[]>config.conflictingAttributes),
            new SyntaxRule(this.reflection, config)

        ].concat(config.customRules);

        this.linter = new Linter(
            rules,
            config.scopes,
            config.voids);

        if (this.config.useStaticTyping)
            this.init = this.reflection.addGlob(this.config.sourceFileGlob)
                .then(() => {
                    if (this.config.useCustomTypings)
                        return this.reflection.addTypingsGlob(this.config.typingsFileGlob);
                    else return Promise.resolve();
                });
    }

    public lint(html: string, path?: string): Promise<Issue[]> {
        if (this.init) {
            return this.init.then(() => {
                this.init = null;
                return this.linter.lint(html, path);
            });
        }
        else {
            return this.linter.lint(html, path);
        }
    }
}
