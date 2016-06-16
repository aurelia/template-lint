"use strict";
const template_lint_1 = require('template-lint');
/**
 * Rule to ensure tags are properly closed.
 */
class RepeatForRule extends template_lint_1.Rule {
    init(parser, parseState) {
        var syntax = /(.+)( +of +)(.+)/;
        parser.on("startTag", (tag, attrs, selfClosing, loc) => {
            var self = this;
            attrs.forEach(attr => {
                if (attr.name == "repeat") {
                    let issue = new template_lint_1.Issue({
                        message: "did you miss `.for` on repeat?",
                        line: loc.line,
                        column: loc.col });
                    self.reportIssue(issue);
                    return;
                }
                if (attr.name == "repeat.for") {
                    var script = attr.value.trim();
                    var matches = script.match(syntax);
                    var error = null;
                    if (matches == null || matches.length == 0) {
                        let error = new template_lint_1.Issue({
                            message: "repeat syntax should be of form `* of *`",
                            line: loc.line,
                            column: loc.col });
                        self.reportIssue(error);
                    }
                }
            });
        });
    }
}
exports.RepeatForRule = RepeatForRule;

//# sourceMappingURL=repeatfor.js.map
