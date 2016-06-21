import {Config} from '../source/config';
import {AureliaLinter} from '../source/aurelia-linter';

describe("Aurelia Examples", () => {

    var config: Config = new Config();
    var linter: AureliaLinter = new AureliaLinter(config);

    it("complains about string interpolation used in style attribute", (done) => {
        var html = "<template><div style=\"width: ${width}px; height: ${height}px;\"></div></template>"

        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("interpolation not allowed in style attribute");
                done();
            });
    });

    it("happy about plain string used in style attribute", (done) => {
        var html = "<template><div style=\"width: 100px; height: 100px;\"></div></template>"

        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("happy about string interpolation used in css attribute", (done) => {
        var html = "<template><div css=\"width: ${width}px; height: ${height}px;\"></div></template>"

        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("complains about camel case bindable", (done) => {
        var html = `<template bindable="myNameIs"></template>`

        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("camelCase bindable is converted to camel-case");
                done();
            });
    });

    it("okay with non-camel-case bindable", (done) => {
        var html = `<template bindable="mynameis"></template>`

        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("okay with correct button", (done) => {
        var html = `<template><button type="reset"></button></template>`

        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("not okay with incorrect button type", (done) => {
        var html = `<template><button type="reste"></button></template>`

        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(1);
                done();
            });
    });    
});