"use strict";
const parse5_1 = require('parse5');
const stream_1 = require('stream');
/**
* Abstract Lint Rule
*/
class Rule {
}
exports.Rule = Rule;
/**
 * Rule to ensure non-void elements do not self-close
 */
class SelfCloseRule extends Rule {
    init(parser) {
        const voidTags = [
            'area', 'base', 'br', 'col', 'embed', 'hr',
            'img', 'input', 'keygen', 'link', 'meta',
            'param', 'source', 'track', 'wbr'];
        var self = this;
        self.errors = [];
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            if (selfClosing) {
                if (voidTags.indexOf(name) < 0) {
                    let error = "self-closing element [line: " + location.line + "]";
                    self.errors.push(error);
                }
            }
        });
    }
}
exports.SelfCloseRule = SelfCloseRule;
/**
 *  Rule to ensure root element is the template element
 */
class TemplateRule extends Rule {
    init(parser) {
        var self = this;
        self.errors = [];
        var isRoot = true;
        var found = 0;
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            if (isRoot) {
                isRoot = false;
                if (name != 'template') {
                    let error = "root element is not template [line: " + location.line + "]";
                    self.errors.push(error);
                    return;
                }
            }
            if (name == 'template') {
                if (found > 0) {
                    let error = "another template element found [line: " + location.line + "]";
                    self.errors.push(error);
                }
                found += 1;
            }
        });
    }
}
exports.TemplateRule = TemplateRule;
/**
 *  Rule to ensure root element is the template element
 */
class RouterRule extends Rule {
    init(parser) {
        var self = this;
        self.errors = [];
        var capture = false;
        var stack = [];
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            if (capture) {
                let error = "tags within router-view are illegal [line: " + location.line + "]";
                self.errors.push(error);
            }
            if (name == 'router-view')
                capture = true;
        });
        parser.on('endTag', (name, location) => {
            if (name == 'router-view')
                capture = false;
        });
    }
}
exports.RouterRule = RouterRule;
/**
 *  Rule to ensure require element is well formed
 */
class RequireRule extends Rule {
    init(parser) {
        var self = this;
        self.errors = [];
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            if (name != 'require')
                return;
            let result = attrs.find(x => x.name == 'from');
            if (!result) {
                let error = "require tag is missing from attribute [line: " + location.line + "]";
                self.errors.push(error);
            }
        });
    }
}
exports.RequireRule = RequireRule;
class Linter {
    constructor(rules) {
        if (!rules)
            rules = [
                new SelfCloseRule(),
                new TemplateRule(),
                new RequireRule(),
                new RouterRule(),
            ];
        this.rules = rules;
    }
    lint(html) {
        var parser = new parse5_1.SAXParser({ locationInfo: true });
        var stream = new stream_1.Readable();
        stream.push(html);
        stream.push(null);
        this.rules.forEach((rule) => {
            rule.init(parser);
        });
        var work = stream.pipe(parser);
        var completed = new Promise(function (resolve, reject) {
            work.on("end", () => { resolve(); });
        });
        var ruleTasks = [];
        this.rules.forEach((rule) => {
            let task = completed.then(() => {
                return rule.errors;
            });
            ruleTasks.push(task);
        });
        return Promise.all(ruleTasks).then(results => {
            var all = [];
            results.forEach(parts => {
                all = all.concat(parts);
            });
            return all;
        });
    }
}
exports.Linter = Linter;

//# sourceMappingURL=template-lint.js.map
