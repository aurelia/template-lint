"use strict";
const template_lint_1 = require('template-lint');
const index_1 = require('../dist/index');
describe("Projection Rule", () => {
    var linter = new template_lint_1.Linter([
        new index_1.ProjectionRule()
    ]);
    it("will reject router-view with tag contents", (done) => {
        linter.lint('<template><router-view><br/></router-view></template>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
    it("will reject slot with tag contents", (done) => {
        linter.lint('<template><slot><br/></slot></template>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
    it("will reject slot with text contents", (done) => {
        linter.lint('<template><slot>hello world!</slot></template>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
    it("will accept slot with no contents", (done) => {
        linter.lint('<template><slot></slot></template>')
            .then((errors) => {
            errors.forEach(element => {
                console.log(element);
            });
            expect(errors.length).toBe(0);
            done();
        });
    });
});

//# sourceMappingURL=projection.spec.js.map
