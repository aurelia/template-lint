"use strict";
const template_lint_1 = require('template-lint');
const template_lint_2 = require('template-lint');
const template_lint_3 = require('template-lint');
const template_lint_4 = require('template-lint');
const template_lint_5 = require('template-lint');
const require_1 = require('./require');
const slot_1 = require('./slot');
const template_1 = require('./template');
const repeatfor_1 = require('./repeatfor');
const conflictingattributes_1 = require('./conflictingattributes');
class Config {
    constructor() {
        this.obsoleteTags = ['content'];
        this.obsoleteAttributes = [{ name: "replaceable", tag: "template" }];
        this.voids = ['area', 'base', 'br', 'col', 'embed', 'hr',
            'img', 'input', 'keygen', 'link', 'meta',
            'param', 'source', 'track', 'wbr'];
        this.scopes = ['html', 'body', 'template', 'svg', 'math'];
        this.rules = null;
        this.customRules = [];
    }
}
exports.Config = Config;
class AureliaLinter {
    constructor(config) {
        if (config == undefined)
            config = new Config();
        let rules = config.rules || [
            new template_lint_2.SelfCloseRule(),
            new template_lint_3.ParserRule(),
            new template_lint_5.ObsoleteAttributeRule(config.obsoleteAttributes),
            new template_lint_4.ObsoleteTagRule(config.obsoleteTags),
            new require_1.RequireRule(),
            new slot_1.SlotRule(),
            new template_1.TemplateRule(),
            new conflictingattributes_1.ConflictingAttributesRule(),
            new repeatfor_1.RepeatForRule()
        ].concat(config.customRules);
        this.linter = new template_lint_1.Linter(rules, config.scopes, config.voids);
    }
    lint(html) {
        return this.linter.lint(html);
    }
}
exports.AureliaLinter = AureliaLinter;

//# sourceMappingURL=aurelia-linter.js.map
