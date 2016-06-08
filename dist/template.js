"use strict";
const template_lint_1 = require('template-lint');
/**
 *  Rule to ensure root element is the template element
 */
class TemplateRule extends template_lint_1.Rule {
    init(parser, parseState) {
        var self = this;
        self.disable = false;
        self.first = true;
        self.count = 0;
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            // Ignore Full HTML Documents
            if (self.disable || name == 'html') {
                self.disable = true;
                return;
            }
            if (self.first) {
                if (name != 'template') {
                    let error = new template_lint_1.RuleError("root element is not template", location.line, location.col);
                    self.reportError(error);
                    return;
                }
                self.count++;
                self.first = false;
                return;
            }
            if (attrs.findIndex(x => x.name == "replace-part") != -1) {
                return;
            }
            if (name == 'template') {
                if (self.count > 0) {
                    if (parseState.stack.length > 0) {
                        let error = new template_lint_1.RuleError("nested template found", location.line, location.col);
                        self.reportError(error);
                    }
                    else {
                        let error = new template_lint_1.RuleError("extraneous template found", location.line, location.col);
                        self.reportError(error);
                    }
                }
                self.count += 1;
            }
        });
    }
    finalise() {
        this.disable = false;
        this.first = true;
        this.count = 0;
        return super.finalise();
    }
}
exports.TemplateRule = TemplateRule;

//# sourceMappingURL=template.js.map
