"use strict";
const parse5_1 = require('parse5');
const parse5 = require('parse5');
const stream_1 = require('stream');
/**
* Abstract Lint Rule
*/
class Rule {
}
/**
 * Rule to ensure non-void elements do not self-close
 */
class SelfCloseRule extends Rule {
    init(parser, root) {
        this.parser = parser;
        this.result = true;
        var self = this;
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            self.result = self.result && (!selfClosing);
        });
    }
    lint(completed) {
        var self = this;
        return completed
            .then(() => {
            if (self.result == false)
                throw "failed";
        });
    }
}
/**
 *  Rule to ensure root element is the template element
 */
class TemplateRootRule extends Rule {
    init(parser, root) {
        this.parser = parser;
        this.result = root.nodeName == 'template';
    }
    lint(completed) {
        var self = this;
        return (this.result) ? Promise.resolve() : Promise.reject(this.error);
    }
}
/**
 *  Rule to ensure a require element is well formed
 */
class RequireRule extends Rule {
    init(parser, root) {
        this.parser = parser;
        this.result = true;
        var self = this;
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            if (name != 'require')
                return;
            var fromAttr = attrs.find((x) => {
                return x.name == 'from';
            });
            if (fromAttr)
                self.result = true;
            else
                self.result = false;
        });
    }
    lint(completed) {
        var self = this;
        return completed
            .then(() => {
            if (self.result == false)
                throw "failed";
        });
    }
}
class Linter {
    constructor() {
        this.rules = [
            new TemplateRootRule(),
            new SelfCloseRule(),
            new RequireRule()
        ];
    }
    lint(html) {
        var parser = new parse5_1.SAXParser({ locationInfo: true });
        var stream = new stream_1.Readable();
        stream.push(html);
        stream.push(null);
        var root = parse5.parseFragment(html, { locationInfo: true });
        this.rules.forEach((rule) => {
            rule.init(parser, root.childNodes[0]);
        });
        var work = stream.pipe(parser);
        var completed = new Promise(function (resolve, reject) {
            work.on("end", () => { resolve(); });
        });
        var ruleTasks = [];
        this.rules.forEach((rule) => {
            var task = rule
                .lint(completed)
                .then(() => true);
            ruleTasks.push(task);
        });
        return Promise.all(ruleTasks).then(() => true).catch(() => false);
    }
}
exports.Linter = Linter;

//# sourceMappingURL=template-lint.js.map
