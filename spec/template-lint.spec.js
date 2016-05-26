"use strict";
/// <reference path="template-lint.ts" />
const template_lint_1 = require('../dist/template-lint');
describe("Linter", () => {
    it("can resolve proper template", (done) => {
        var linter = new template_lint_1.Linter();
        linter.lint('<template></template>')
            .then((result) => {
            expect(result).toBe(true);
            done();
        });
    });
    it("can reject improper template", (done) => {
        var linter = new template_lint_1.Linter();
        linter.lint('<tempe></tempjlate>')
            .then((result) => {
            expect(result).toBe(false);
            done();
        });
    });
    it("can reject self-closed template", (done) => {
        var linter = new template_lint_1.Linter();
        linter.lint('<template/>')
            .then((result) => {
            expect(result).toBe(false);
            done();
        });
    });
    it("can reject self-closed custom-element", (done) => {
        var linter = new template_lint_1.Linter();
        linter.lint('<template><custom-element/></template>')
            .then((result) => {
            expect(result).toBe(false);
            done();
        });
    });
});

//# sourceMappingURL=template-lint.spec.js.map
