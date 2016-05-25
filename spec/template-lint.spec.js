"use strict";
/// <reference path="template-lint.ts" />
const template_lint_1 = require('../dist/template-lint');
describe("Template Lint", () => {
    it("can ignore proper template", (done) => {
        var lint = new template_lint_1.TemplateLint();
        lint.hasSelfCloseTags('<template></template>')
            .then((result) => {
            expect(result).toBe(false);
            done();
        });
    });
    it("can detect self-closed template", (done) => {
        var lint = new template_lint_1.TemplateLint();
        lint.hasSelfCloseTags('<template/>')
            .then((result) => {
            expect(result).toBe(true);
            done();
        });
    });
    it("can detect self-closed custom-element", (done) => {
        var lint = new template_lint_1.TemplateLint();
        lint.hasSelfCloseTags('<template><custom-element/></template>')
            .then((result) => {
            expect(result).toBe(true);
            done();
        });
    });
});
