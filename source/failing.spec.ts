"use strict";

import {AureliaLinter, Config} from './aurelia-linter';

describe("Failing Scenarios", () => {
    var config: Config = new Config();
    var linter: AureliaLinter = new AureliaLinter(config);

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