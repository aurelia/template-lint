"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const index_1 = require("../../dist/index");
const index_2 = require("../../dist/index");
const html_parse_1 = require("../../dist/tasks/html-parse");
/**
 * Parser Task Tests
 */
describe("Task: Html Parse", () => {
    /**
     * Parser Traversal State Tests
     */
    describe("Traversal State", () => {
        it("should create an issue when non-void element is not closed", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: "<template>",
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("suspected unclosed element detected");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should create an issue when closing-element doesn't match open element", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: "<template></div>",
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(2);
                expect(issues[0].message).toBe("mismatched close tag");
                expect(issues[1].message).toBe("suspected unclosed element detected");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
    });
    /**
     * AST Generation Hook Tests
     */
    describe("Hook: AST Generator", () => {
        it("should generate AST node in file result", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: "<template></template>",
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const ast = file["ast"];
                expect(ast).toBeDefined();
                const astNodes = ast.children;
                expect(astNodes.length).toBe(1);
                const rootNode = astNodes[0];
                expect(rootNode.name).toBe("template");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
    });
    /**
     * Self-Close Hook Tests
     */
    describe("Hook: Self Close", () => {
        it("should create an issue for non-void self-closing elements", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: "<template/><template><div/><custom-element/></template>",
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(3);
                expect(issues[0].message).toBe("self-closing element");
                expect(issues[1].message).toBe("self-closing element");
                expect(issues[2].message).toBe("self-closing element");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should create an issue for self-closed svg element", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: "<template><svg/></template>",
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("self-closing element");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should allow self-close within svg scope", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: "<template><svg><rect/><circle/><line/><text></text><line/></svg></template>",
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(0);
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should create an issue for self-closed math element", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: "<template><math/></template>",
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("self-closing element");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should allow self-close within math scope", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: "<template><math><plus/></math></template>",
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(0);
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
    });
    /**
    * Obsolete Hook
    */
    describe("Hook: Obsolete", () => {
        it("should create an issue for obsolete element", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                opts["obsolete-elements"].push({ elmt: "undef", msg: "" });
                opts["obsolete-elements"].push({ elmt: "foo", msg: "boo" });
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: "<template><foo></foo></template>",
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("foo element is obsolete");
                expect(issues[0].detail).toBe("boo");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should create an issue for obsolete attribute", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                opts["obsolete-attributes"].push({ attr: "pop", msg: "boo" });
                opts["obsolete-attributes"].push({ attr: "undef", msg: "" });
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: `<template><foo pop="value"></foo></template>`,
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("pop attribute is obsolete");
                expect(issues[0].detail).toBe("boo");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should create an issue for obsolete attribute on matching element", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                opts["obsolete-attributes"].push({ attr: "undef", msg: "" });
                opts["obsolete-attributes"].push({ attr: "pop", elmt: "foo", msg: "boo" });
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: `<template><foo pop="value"></foo></template>`,
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("pop attribute is obsolete");
                expect(issues[0].detail).toBe("boo");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should not create an issue for obsolete attribute on non-matching element", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                opts["obsolete-attributes"].push({
                    attr: "pop",
                    elmt: "foo",
                    msg: "boo"
                });
                var task = new html_parse_1.HtmlParseTask(opts);
                var file = new index_2.File({
                    content: `<template><moo pop="value"></moo></template>`,
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                yield task.process(file);
                const issues = file.issues;
                expect(issues).toBeDefined();
                expect(issues.length).toBe(0);
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
    });
});

//# sourceMappingURL=html-parser.spec.js.map
