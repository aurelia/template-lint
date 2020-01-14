"use strict";

import { Linter, Rule } from 'template-lint';

import { initialize } from 'aurelia-pal-nodejs';

import { AureliaLinter } from '../source/aurelia-linter';
import { Config } from '../source/config';
import { Reflection } from '../source/reflection';
import { BindingRule } from '../source/rules/binding';

initialize();

describe("Failing Scenarios", () => {
  //uncomment, add your example and what you expect. 

  /*it("some test that fails", (done) => {
    var config: Config = new Config();
    var linter: AureliaLinter = new AureliaLinter(config);
    var html = `<template></etemps> <!-- oops! -->`;
    try {
      linter.lint(html)
        .then((issues) => {
          expect(issues.length).toBe(0);
        });
    }
    catch (err) { fail(err); }
    finally { done(); }
  });*/

});
