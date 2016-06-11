"use strict";
const aurelia_linter_1 = require('../dist/aurelia-linter');
describe("Failing Scenarios", () => {
    var config = new aurelia_linter_1.Config();
    var linter = new aurelia_linter_1.AureliaLinter(config);
    //uncomment, add your example and what you expect. 
    /*it("some test that fails", (done) => {
        var html = `<template></etemps> <!-- oops! -->`
        linter.lint(html)
            .then((errors) => {
                expect(errors.length).toBe(0);
                done();
            });
    });*/
});

//# sourceMappingURL=failing.spec.js.map
