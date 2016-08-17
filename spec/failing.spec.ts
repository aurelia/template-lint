"use strict";

import {Linter, Rule} from 'template-lint';
import {Config} from '../source/config';
import {AureliaLinter} from '../source/aurelia-linter';
import {BindingRule} from '../source/rules/binding';
import {Reflection} from '../source/reflection';
import {initialize} from 'aurelia-pal-nodejs';

initialize();

describe("Failing Scenarios", () => {
  //uncomment, add your example and what you expect. 
  /*
  it("some test that fails", (done) => {
    var config: Config = new Config();
    var linter: AureliaLinter = new AureliaLinter(config);
    var html = `<template></etemps> <!-- oops! -->`
    linter.lint(html)
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch (err) { fail(err); }
        finally { done(); }
      });
  });
  */

  it("issue #87 - Unknown instruction type: NameExpression", (done) => {
    let viewmodel = `
    export class Foo{
      existingElement: HTMLSelectElement;
      existing: string;
    }`
    let view = `
    <template>
      <select ref="existingElement"></select>
      <select ref="missingElement"></select>
      \${existing}
      \${missing}
    </template>`
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, {reportExceptions: true});
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(2);
        expect(issues[0].message).toContain("cannot find 'missingElement' in type 'Foo'");
        expect(issues[1].message).toContain("cannot find 'missing' in type 'Foo'");
        done();
      })
  });
});