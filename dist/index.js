"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
const template_lint_1 = require('template-lint');
const template_lint_2 = require('template-lint');
const template_1 = require('./template');
const slot_1 = require('./slot');
const require_1 = require('./require');
__export(require('./template'));
__export(require('./require'));
__export(require('./slot'));
exports.DefaultRules = [
    new template_lint_1.SelfCloseRule(),
    new template_lint_2.ParserRule(),
    new template_1.TemplateRule(),
    new slot_1.SlotRule(),
    new require_1.RequireRule(),
];

//# sourceMappingURL=index.js.map
