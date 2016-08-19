import { Config } from '../source/config';
import { AureliaLinter } from '../source/aurelia-linter';

describe("Aurelia Examples", () => {

    var config: Config = new Config();

    config.obsoleteTagOpts.push({ tag: 'my-old-tag' });

    var linter: AureliaLinter = new AureliaLinter(config);

    /*  it("readme example'", (done) => {
            var html = `<template>
        <require/>
        <require frm="bad"/> 
    
        <div repeat="item of items"></div>
        <div repeat.for="item of"></div>
    
        <content></content>
    
        <slot></slot>
        <slot></slot>    
           
        <table>
            <template></template>     
        </table>
        <div repeat.for="user of users" with.bind="user"></div>
    </etemps> <!-- oops! -->`
            linter.lint(html)
                .then((issues) => {
    
                    issues = issues.sort((a, b) => a.line - b.line);
                    issues.forEach(error => {
                        console.log(`${error.message} [ln: ${error.line} col: ${error.column}]`);
                        if (error.detail) console.log(`  * ${error.detail}`);
                    });
                    done();
                });
        });*/

    it("linter allows configerable obsolete tag", (done) => {
        var html = `
            <template>
                <my-old-tag></my-old-tag>
            </template>                  
            `
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("<my-old-tag> is obsolete");
                done();
            });
    });

    it("linter okay with 'A Simple Template'", (done) => {
        var html = `
            <template>
                <div>Hello World!</div>
            </template>                  
            `
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("linter okay with 'Requiring Resources'", (done) => {
        var html = `
            <template>
            <require from='nav-bar'></require>

            <nav-bar router.bind="router"></nav-bar>

            <div class="page-host">
                <router-view></router-view>
            </div>
            </template>  
            `
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("linter not okay with 'Illegal Table Code '", (done) => {
        var html = `
            <template>
            <table>
                <template repeat.for="customer of customers">
                <td>\${customer.fullName}</td>
                </template>
            </table>
            </template>
            `
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBeGreaterThan(0);
                done();
            });
    });

    it("linter okay with 'Correct Table Code'", (done) => {
        var html = `
            <template>
            <table>
                <tr repeat.for="customer of customers">
                <td>\${customer.fullName}</td>
                </tr>
            </table>
            </template>
            `
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });


    it("linter not okay with 'Illegal Select Code'", (done) => {
        var html = `
            <template>
            <select>
                <template repeat.for="customer of customers">
                <option>...</option>
                </template>
            </select>
            </template> `
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBeGreaterThan(0);
                done();
            });
    });

    it("linter okay with 'Correct Select Code'", (done) => {
        var html = `  
            <template>
            <select>
                <option repeat.for="customer of customers">...</option>
            </select>
            </template>
            `
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("complains about obsolete <content>'", (done) => {
        var html = `  
            <template>
            <content>
            </content>
            </template>
            `
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("<content> is obsolete");
                done();
            });
    });

    /*it("complains about obsolete attribute `replaceable` ", (done) => {
        var html = `  
            <template replaceable="">
            </template>
            `
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("replaceable attribute is obsolete");
                done();
            });
    });*/

    it("allows binding of id attribute", (done) => {
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

    it("will reject more than one template-controller on same element", (done) => {
        var config: Config = new Config();
        var linter: AureliaLinter = new AureliaLinter(config);
        var html = `
        <template>
          <div repeat.for="item of item" with.bind="item">
          </div>
        </template>`
        linter.lint(html)
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("conflicting attributes: [repeat.for, with.bind]");
                done();
            });
    });
});