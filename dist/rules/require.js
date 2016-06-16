"use strict";
const template_lint_1 = require('template-lint');
/**
 *  Rule to ensure require element is well formed
 */
class RequireRule extends template_lint_1.Rule {
    init(parser, parseState) {
        var self = this;
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            if (name != 'require')
                return;
            let result = attrs.find(x => x.name == 'from');
            if (!result) {
                let error = new template_lint_1.Issue({
                    message: "require tag is missing a 'from' attribute",
                    line: location.line,
                    column: location.col });
                self.reportIssue(error);
            }
        });
    }
}
exports.RequireRule = RequireRule;

//# sourceMappingURL=require.js.map
