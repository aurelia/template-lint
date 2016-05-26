"use strict";
/// <reference path="template-lint.ts" />
const template_lint_1 = require('../dist/template-lint');
describe("SelfClose Rule", () => {
    var linter = new template_lint_1.Linter([
        new template_lint_1.SelfCloseRule()
    ]);
    it("will reject self-closed template", (done) => {
        linter.lint('<template/>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
    it("will reject self-closed non-void", (done) => {
        linter.lint('<template><div/></template>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
    it("will reject self-closed custom-element", (done) => {
        linter.lint('<template><custom-element/></template>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
    it("will allow self-closed void elements", (done) => {
        linter.lint('<template><br/></template>')
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
});
describe("Template Rule", () => {
    var linter = new template_lint_1.Linter([
        new template_lint_1.TemplateRule()
    ]);
    it("will accept template root element", (done) => {
        linter.lint('<temslat></temslat>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
    it("will reject non-template root element", (done) => {
        linter.lint('<template></template>')
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
    it("will reject more than one template", (done) => {
        linter.lint('<template></template><template></template>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
});
describe("Router Rule", () => {
    var linter = new template_lint_1.Linter([
        new template_lint_1.RouterRule()
    ]);
    it("will reject router-view with tag contents", (done) => {
        linter.lint('<template><router-view><br/></router-view></template>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
});
describe("Require Rule", () => {
    var linter = new template_lint_1.Linter([
        new template_lint_1.RequireRule()
    ]);
    it("will reject require elements without a from attribute", (done) => {
        linter.lint('<template><require fgh="something"></require></template>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
});

//# sourceMappingURL=template-lint.spec.js.map
