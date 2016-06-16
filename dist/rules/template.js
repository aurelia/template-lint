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
        this.disable = false;
        this.first = true;
        this.count = 0;
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            // Ignore Full HTML Documents
            if (this.disable || name == 'html') {
                this.disable = true;
                return;
            }
            if (this.first) {
                if (name != 'template') {
                    let error = new template_lint_1.Issue({
                        message: "root element is not template",
                        line: location.line,
                        column: location.col });
                    this.reportIssue(error);
                    return;
                }
                this.count++;
                this.first = false;
                return;
            }
            if (name == 'template') {
                if (this.count > 0) {
                    let stack = parseState.stack;
                    let stackCount = stack.length;
                    if (stackCount > 0) {
                        this.containers.forEach(containerName => {
                            if (stack[stackCount - 1].name == containerName) {
                                let error = new template_lint_1.Issue({
                                    message: `template as child of <${containerName}> not allowed`,
                                    line: location.line,
                                    column: location.col
                                });
                                this.reportIssue(error);
                            }
                        });
                    }
                    else {
                        let error = new template_lint_1.Issue({
                            message: "more than one template in file",
                            line: location.line,
                            column: location.col });
                        this.reportIssue(error);
                    }
                }
                this.count += 1;
            }
        });
    }
}
exports.TemplateRule = TemplateRule;

//# sourceMappingURL=template.js.map
