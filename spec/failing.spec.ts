"use strict";

import {Config} from '../source/config';
import {AureliaLinter} from '../source/aurelia-linter';

describe("Failing Scenarios", () => {
    var config: Config = new Config();
    var linter: AureliaLinter = new AureliaLinter(config);

    //uncomment, add your example and what you expect. 
    /*it("some test that fails", (done) => {
        var html = `<template></etemps> <!-- oops! -->`
        linter.lint(html)
            .then((issues) => {                   
                expect(issues.length).toBe(0);
                done();
            });
    });*/

    // #42
    it("id contains illegal characters", (done) => {
        var html = `
        <template>
          <div id="\${model.type}-\${model.id}-selected">
          </div>
        </template>`
        linter.lint(html)
            .then((issues) => {
                console.log(issues);
                expect(issues.length).toBe(0);
                done();
            });
    });
});