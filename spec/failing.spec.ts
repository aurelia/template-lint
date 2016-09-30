"use strict";

import { Linter, Rule } from 'template-lint';
import { Config } from '../source/config';
import { AureliaLinter } from '../source/aurelia-linter';
import { BindingRule } from '../source/rules/binding';
import { Reflection } from '../source/reflection';
import { initialize } from 'aurelia-pal-nodejs';

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

  // #112
  it("Support for re-exported types", (done) => {

    let item = `
    export class Item{
      prop: string;
    }`;
    
    let common = `
    export * from './item;
    `;

    let viewmodel = `
    import {Item} from './common;
    export class Foo{
      items: Item[]
    }`;
    
    let view = `
    <template>
       <div repeat.for="item in items">
        \${item.prop}
      </div>
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, { reportExceptions: true });
    let linter = new Linter([rule]);

    reflection.add("./path/item.ts", item);
    reflection.add("./path/common.ts", common);
    reflection.add("./path/foo.ts", viewmodel);    
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch (err) { fail(err); }
        finally { done(); }
      });
  });

});
