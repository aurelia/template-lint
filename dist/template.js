"use strict";
const template_lint_1 = require('template-lint');
/**
 *  Rule to ensure root element is the template element
 */
class TemplateRule extends template_lint_1.Rule {
    constructor(containers) {
        super();
        this.containers = containers;
        if (!this.containers)
            this.containers = ['table', 'select'];
    }
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
            if (name == 'template') {
                if (self.count > 0) {
                    let stack = parseState.stack;
                    let stackCount = stack.length;
                    if (stackCount > 0) {
                        self.containers.forEach(containerName => {
                            if (stack[stackCount - 1].name == containerName) {
                                let error = new template_lint_1.RuleError(`template as child of <${containerName}> not allowed`, location.line, location.col);
                                self.reportError(error);
                            }
                        });
                    }
                    else {
                        let error = new template_lint_1.RuleError("more than one template in file", location.line, location.col);
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
