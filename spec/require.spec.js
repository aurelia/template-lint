"use strict";
const template_lint_1 = require('template-lint');
const require_1 = require('../dist/require');
describe("Require Rule", () => {
    var linter = new template_lint_1.Linter([
        new require_1.RequireRule()
    ]);
    it("will pass require elements with a from attribute", (done) => {
        linter.lint('<template><require from="something"></require></template>')
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
    it("will reject require elements without a from attribute", (done) => {
        linter.lint('<template><require fgh="something"></require></template>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
});

//# sourceMappingURL=require.spec.js.map
