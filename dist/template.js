"use strict";
const template_lint_1 = require('template-lint');
/**
 *  Rule to ensure root element is the template element
 */
class TemplateRule extends template_lint_1.Rule {
    init(parser, parseState) {
        var self = this;
        var disable = false;
        var first = true;
        var count = 0;
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            // Ignore Full HTML Documents
            if (disable || name == 'html') {
                disable = true;
                return;
            }
            if (first) {
                if (name != 'template') {
                    let error = new template_lint_1.RuleError("root element is not template", location.line, location.col);
                    self.reportError(error);
                    return;
                }
                count++;
                first = false;
                return;
            }
            if (name == 'template') {
                if (count > 0) {
                    if (parseState.stack.length > 0) {
                        let error = new template_lint_1.RuleError("nested template found", location.line, location.col);
                        self.reportError(error);
                    }
                    else {
                        let error = new template_lint_1.RuleError("extraneous template found", location.line, location.col);
                        self.reportError(error);
                    }
                }
                count += 1;
            }
        });
    }
}
exports.TemplateRule = TemplateRule;

//# sourceMappingURL=template.js.map
