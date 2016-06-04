"use strict";
const template_lint_1 = require('template-lint');
const repeatfor_1 = require('../dist/repeatfor');
describe("RepeatFor Rule", () => {
    var linter = new template_lint_1.Linter([
        new repeatfor_1.RepeatForRule()
    ]);
    it("will pass item of items", (done) => {
        linter.lint('<div repeat.for="item of items"></div>')
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
    it("will pass i of 10", (done) => {
        linter.lint('<div repeat.for="i of 10"></div>')
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
    it("will pass i of 10|converter:'format'", (done) => {
        linter.lint('<div repeat.for="i of 10|converter:\'format\'"></div>')
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
    it("will pass item of items|converter:'format'", (done) => {
        linter.lint('<div repeat.for="i of 10|converter:\'format\'"></div>')
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
    it("will pass [foo, boo] of items", (done) => {
        linter.lint('<div repeat.for="[foo, boo] of items"></div>')
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
    it("will reject item of", (done) => {
        linter.lint('<div repeat.for="item of  "></div>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
    it("will reject item", (done) => {
        linter.lint('<div repeat.for="item "></div>')
            .then((errors) => {
            expect(errors.length).toBeGreaterThan(0);
            done();
        });
    });
});

//# sourceMappingURL=repeatfor.spec.js.map
