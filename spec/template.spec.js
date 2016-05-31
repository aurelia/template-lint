"use strict";
const template_lint_1 = require('template-lint');
const index_1 = require('../dist/index');
describe("Template Rule", () => {
    var linter = new template_lint_1.Linter([
        new index_1.TemplateRule()
    ]);
    it("will accept template root element", (done) => {
        linter.lint('<template></template>')
            .then((errors) => {
            errors.forEach(element => {
                console.log(element);
            });
            expect(errors.length).toBe(0);
            done();
        });
    });
    it("will reject non-template root element", (done) => {
        linter.lint('<temslat></temslat>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
    it("will ignore html non-template root element", (done) => {
        linter.lint('<html><temslat></temslat></html>')
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
    it("will reject more than one template", (done) => {
        linter.lint('<template></template><template></template>')
            .then((errors) => {
            expect(errors[0].message).toBe("extraneous template found");
            done();
        });
    });
    it("will reject nested template", (done) => {
        linter.lint('<template><template></template></template>')
            .then((errors) => {
            expect(errors[0].message).toBe("nested template found");
            done();
        });
    });
    it("will pass template with valid contents", (done) => {
        linter.lint('<template><button></button><div></div></template>')
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
});

//# sourceMappingURL=template.spec.js.map
