"use strict";

import {Linter, Rule} from 'template-lint';
import {Config} from '../source/config';
import {AureliaLinter} from '../source/aurelia-linter';
import {Reflection} from '../source/reflection';
import {StaticTypeRule} from '../source/rules/static-type';

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

    // #42
    it("id contains illegal characters", (done) => {
        var config: Config = new Config();
        var linter: AureliaLinter = new AureliaLinter(config);
        var html = `
        <template>
          <div id="\${model.type}-\${model.id}-selected">
          </div>
        </template>`
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    // #35
    it("repeat.for doesn't work with interfaces imported from other files", (done) => {
        var reflection = new Reflection();

        var item = `
        export interface Item {
            name:string
        }`
        var page = `
        import {Item} from "./item"; 
        export class Page {
             items: Item[];
        }`
        var html = `
        <template>
          <template repeat.for="item of items">
          \${item}
          \${item.name}
          \${item.nme}
          </template>
        </template>`

        reflection.add('./item.ts', item);
        reflection.add('./page.ts', page);

        var linter: Linter = new Linter([
      new StaticTypeRule(reflection)
    ]);

        linter.lint(html, "./page.html")
            .then((issues) => {
                try {
                    expect(issues.length).toBe(1);
                    expect(issues[0].message).toContain("cannot find 'nme' in type 'Item'");
                }
                finally {
                    done();
                }
            });
    });
});