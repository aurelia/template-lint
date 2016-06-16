"use strict";
const template_lint_1 = require('template-lint');
const template_lint_2 = require('template-lint');
const template_lint_3 = require('template-lint');
const template_lint_4 = require('template-lint');
const template_lint_5 = require('template-lint');
const template_lint_6 = require('template-lint');
const template_lint_7 = require('template-lint');
const require_1 = require('./rules/require');
const slot_1 = require('./rules/slot');
const template_1 = require('./rules/template');
const repeatfor_1 = require('./rules/repeatfor');
const conflictingattributes_1 = require('./rules/conflictingattributes');
const config_1 = require('./config');
class AureliaLinter {
    constructor(config) {
        if (config == undefined)
            config = new config_1.Config();
        let rules = [
            new template_lint_2.SelfCloseRule(),
            new template_lint_3.ParserRule(),
            new template_lint_5.ObsoleteAttributeRule(config.obsoleteAttributes),
            new template_lint_4.ObsoleteTagRule(config.obsoleteTags),
            new template_lint_6.UniqueIdRule(),
            new template_lint_7.AttributeValueRule(config.attributeValueRules),
            new require_1.RequireRule(),
            new slot_1.SlotRule(),
            new template_1.TemplateRule(config.containers),
            new conflictingattributes_1.ConflictingAttributesRule(config.conflictingAttributes),
            new repeatfor_1.RepeatForRule()
        ].concat(config.customRules);
        this.linter = new template_lint_1.Linter(rules, config.scopes, config.voids);
        // fix to many event-handler issue
        require('events').EventEmitter.prototype._maxListeners = 100;
    }
    lint(html) {
        return this.linter.lint(html);
    }
}
exports.AureliaLinter = AureliaLinter;

//# sourceMappingURL=aurelia-linter.js.map
