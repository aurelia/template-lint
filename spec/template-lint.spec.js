"use strict";
/// <reference path="../dist/template-lint.d.ts" />
var template_lint_1 = require('../dist/template-lint');
describe("A suite", function () {
    it("contains spec with an expectation", function () {
        var lint = new template_lint_1.TemplateLint();
        expect(lint.pass()).toBe(true);
    });
});
