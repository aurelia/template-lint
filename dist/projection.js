"use strict";
const template_lint_1 = require('template-lint');
/**
 *  Rule to ensure root element is the template element
 */
class ProjectionRule extends template_lint_1.Rule {
    constructor(projTags) {
        super();
        if (!projTags)
            projTags = ['slot', 'router-view', 'content'];
        this.projTags = projTags;
    }
    init(parser, parseState) {
        var self = this;
        var stack = parseState.stack;
        let contentCheck = (name, attrs, selfClosing, location, errorStr) => {
            if (stack.length > 0) {
                let parent = stack[stack.length - 1];
                self.projTags.forEach(tag => {
                    if (parent.name === tag) {
                        let error = new template_lint_1.RuleError("found content within projection target (" + tag + ")", parent.location.line, parent.location.col);
                        self.reportError(error);
                        return;
                    }
                });
            }
        };
        parser.on('startTag', contentCheck);
        parser.on("text", contentCheck);
    }
}
exports.ProjectionRule = ProjectionRule;

//# sourceMappingURL=projection.js.map
