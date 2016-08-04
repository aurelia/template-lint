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
  /*it("some test that fails", (done) => {
      var config: Config = new Config();
      var linter: AureliaLinter = new AureliaLinter(config);
      var html = `<template></etemps> <!-- oops! -->`
      linter.lint(html)
          .then((issues) => {                   
              expect(issues.length).toBe(0);
              done();
          });
  });*/

  //#67
  it("support custom elements", (done) => {
    let itemCustomElement = `
    import {bindable} from "aurelia-templating";
    export class ItemCustomElement {
        @bindable value: string;
    }`;

    let pageViewModel = `
    export class Foo {
      fooValue:number;
    }`

    let pageView = `
    <template>
      <require from="./item"></require>
      <item bad.bind="fooValue" value.bind="fooValue"></item>
    </template>`

    let reflection = new Reflection();
    let rule = new BindingRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./item.ts", itemCustomElement);
    reflection.add("./page.ts", pageViewModel);
    linter.lint(pageView, "./page.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'bad' in type 'ItemCustomElement'")
        }
        catch (err) { fail(err); }
        finally { done(); }
      })
  });

  // 
  it("binding to method should cause no exception", (done) => {

    let pageViewModel = `
    export class Page {
      value:number;
      public submit) {        
      }
    }`

    let pageView = `
    <template>
      \${value}
      <form role="form" submit.delegate="submit()"></form>
    </template>`

    let reflection = new Reflection();
    let rule = new BindingRule(reflection, {reportExceptions:true});
    let linter = new Linter([rule]);
    reflection.add("./page.ts", pageViewModel);
    linter.lint(pageView, "./page.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch (err) { fail(err); }
        finally { done(); }
      })
  });
});