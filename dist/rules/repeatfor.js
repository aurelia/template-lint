"use strict";
const template_lint_1 = require('template-lint');
/**
 * Rule to ensure tags are properly closed.
 */
class RepeatForRule extends template_lint_1.Rule {
    init(parser, parseState) {
        super.init(parser, parseState);
        var syntax = /(.+)( +of +)(.+)/;
        parser.on("startTag", (tag, attrs, selfClosing, loc) => {
            var self = this;
            attrs.forEach(attr => {
                if (attr.name == "repeat") {
                    let error = new template_lint_1.RuleError("did you miss `.for` on repeat?", loc.line, loc.col);
                    self.reportError(error);
                    return;
                }
                if (attr.name == "repeat.for") {
                    var script = attr.value.trim();
                    var matches = script.match(syntax);
                    var error = null;
                    if (matches == null || matches.length == 0) {
                        let error = new template_lint_1.RuleError("repeat syntax should be of form `* of *`", loc.line, loc.col);
                        self.reportError(error);
                    }
                }
            });
        });
    }
}
exports.RepeatForRule = RepeatForRule;

//# sourceMappingURL=repeatfor.js.map
