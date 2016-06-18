import {Linter, Rule, Issue, IssueSeverity} from 'template-lint';

import {SelfCloseRule} from 'template-lint';
import {StructureRule} from 'template-lint';
import {ObsoleteTagRule} from 'template-lint';
import {ObsoleteAttributeRule} from 'template-lint';
import {UniqueIdRule} from 'template-lint';
import {AttributeValueRule} from 'template-lint';

import {RequireRule} from './rules/require';
import {SlotRule} from './rules/slot';
import {TemplateRule} from './rules/template';
import {RepeatForRule} from './rules/repeatfor';
import {ConflictingAttributesRule, ConflictingAttributes} from './rules/conflictingattributes';

import {Config} from './config';

export class AureliaLinter {
    linter: Linter;

    constructor(config?: Config) {

        if (config == undefined)
            config = new Config();

        let rules = [
            new SelfCloseRule(),
            new StructureRule(),
            new ObsoleteAttributeRule(config.obsoleteAttributes),
            new ObsoleteTagRule(config.obsoleteTags),
            new UniqueIdRule(),
            new AttributeValueRule(config.attributeValueRules),

            new RequireRule(),
            new SlotRule(config.templateControllers),
            new TemplateRule(config.containers),
            new ConflictingAttributesRule(<ConflictingAttributes[]> config.conflictingAttributes),
            new RepeatForRule()

        ].concat(config.customRules);

        this.linter = new Linter(
            rules,
            config.scopes,
            config.voids);

        // fix to many event-handler issue
        require('events').EventEmitter.prototype._maxListeners = 100;
    }

    public lint(html: string): Promise<Issue[]> {
        return this.linter.lint(html);
    }
}
