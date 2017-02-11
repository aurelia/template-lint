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
const html_require_1 = require("../../dist/tasks/html-require");
/**
 * HTML Template Requires
 */
describe("Task: Html Require Element", () => {
    describe("Value", () => {
        it("should create an issue when 'from' missing", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var file = new index_2.File({
                    content: '<template><require></require></template>',
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                var html = new html_parse_1.HtmlParseTask(opts);
                var task = new html_require_1.HtmlRequireTask(opts);
                yield html.process(file);
                yield task.process(file, (path) => __awaiter(this, void 0, void 0, function* () {
                    return new index_2.File({ content: "", kind: index_2.FileKind.Html });
                }));
                const issues = file.issues;
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("missing a 'from' attribute");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should create an issue when 'from' value is empty", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var file = new index_2.File({
                    content: '<template><require from></require></template>',
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                var html = new html_parse_1.HtmlParseTask(opts);
                var task = new html_require_1.HtmlRequireTask(opts);
                yield html.process(file);
                yield task.process(file, (path) => __awaiter(this, void 0, void 0, function* () {
                    return new index_2.File({ content: "", kind: index_2.FileKind.Html });
                }));
                const issues = file.issues;
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("'from' cannot be empty");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
    });
    describe("Fetch", () => {
        it("should be called with require's 'from' path value", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var file = new index_2.File({
                    content: '<template><require from="foo"></require></template>',
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                var html = new html_parse_1.HtmlParseTask(opts);
                var task = new html_require_1.HtmlRequireTask(opts);
                var fetchExpected = new index_2.File({ content: "", kind: index_2.FileKind.Html });
                var fetchCount = 0;
                var fetchRequest = "";
                yield html.process(file);
                yield task.process(file, (path) => __awaiter(this, void 0, void 0, function* () {
                    fetchCount += 1;
                    fetchRequest = path;
                    return fetchExpected;
                }));
                expect(fetchCount).toBe(1);
                expect(fetchRequest).toBe("foo");
                expect(file.imports["foo"]).toBeDefined();
                expect(file.imports["foo"].file).toBe(fetchExpected);
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should call fetch with absolute path", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var fooFile = new index_2.File({
                    content: '<template><require from="../bar.html"></require></template>',
                    path: "some/path/to/foo.html",
                    kind: index_2.FileKind.Html
                });
                var barFile = new index_2.File({
                    content: '',
                    path: "some/path/bar.html",
                    kind: index_2.FileKind.Html
                });
                var html = new html_parse_1.HtmlParseTask(opts);
                var task = new html_require_1.HtmlRequireTask(opts);
                var fetchExpected = barFile;
                var fetchCount = 0;
                var fetchRequest = "";
                yield html.process(fooFile);
                yield task.process(fooFile, (path) => __awaiter(this, void 0, void 0, function* () {
                    fetchCount += 1;
                    fetchRequest = path;
                    return barFile;
                }));
                expect(fetchCount).toBe(1);
                expect(fetchRequest).toBe("some/path/bar.html");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should normalise window-style paths and fetch postix style", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var fooFile = new index_2.File({
                    content: '<template><require from="..\\bar.html"></require></template>',
                    path: "some\\path\\to\\foo.html",
                    kind: index_2.FileKind.Html
                });
                var barFile = new index_2.File({
                    content: '',
                    path: "some\\path\\bar.html",
                    kind: index_2.FileKind.Html
                });
                var html = new html_parse_1.HtmlParseTask(opts);
                var task = new html_require_1.HtmlRequireTask(opts);
                var fetchExpected = barFile;
                var fetchCount = 0;
                var fetchRequest = "";
                yield html.process(fooFile);
                yield task.process(fooFile, (path) => __awaiter(this, void 0, void 0, function* () {
                    fetchCount += 1;
                    fetchRequest = path;
                    return barFile;
                }));
                expect(fetchCount).toBe(1);
                expect(fetchRequest).toBe("some/path/bar.html");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should create an issue when fetch returns undefined", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                opts["report-html-require-not-found"] = true;
                var file = new index_2.File({
                    content: '<template><require from="bar"></require></template>',
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                var html = new html_parse_1.HtmlParseTask(opts);
                var task = new html_require_1.HtmlRequireTask(opts);
                yield html.process(file);
                yield task.process(file, (path) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                const issues = file.issues;
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("cannot find bar");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
    });
    describe("Triage", () => {
        it("should ignore any loader", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                opts["source-ext"] = "js";
                var fooFile = new index_2.File({
                    content: '<template><require from="./bar!text"></require></template>',
                    path: "foo.html",
                    kind: index_2.FileKind.Html
                });
                var html = new html_parse_1.HtmlParseTask(opts);
                var task = new html_require_1.HtmlRequireTask(opts);
                var fetchCount = 0;
                yield html.process(fooFile);
                yield task.process(fooFile, (path) => __awaiter(this, void 0, void 0, function* () {
                    fetchCount += 1;
                }));
                expect(fetchCount).toBe(0);
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

//# sourceMappingURL=html-require.spec.js.map
