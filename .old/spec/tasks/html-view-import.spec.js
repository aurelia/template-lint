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
const html_view_import_1 = require("../../dist/tasks/html-view-import");
/**
 * HTML Template Requires
 */
describe("Task: Html View Import", () => {
    describe("Checks", () => {
        it("should create an issue when view-model exists for view-only import", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var opts = new index_1.Options();
                var foo = new index_2.File({
                    content: '<template><require from="./item.html"></require></template>',
                    path: "./foo.html",
                    kind: index_2.FileKind.Html
                });
                var itemView = new index_2.File({
                    content: '<template></template>',
                    path: "./item.html",
                    kind: index_2.FileKind.Html
                });
                var itemViewModel = new index_2.File({
                    content: 'export class Item {}',
                    path: "./item.ts",
                    kind: index_2.FileKind.Source
                });
                var files = [foo, itemView, itemViewModel];
                var fetch = (path) => __awaiter(this, void 0, void 0, function* () {
                    for (var file of files) {
                        if (file.path == path) {
                            return file;
                        }
                    }
                    return undefined;
                });
                var tasks = new Array(new html_parse_1.HtmlParseTask(opts), new html_require_1.HtmlRequireTask(opts));
                for (var task of tasks) {
                    yield task.process(foo, fetch);
                }
                var viewImportTask = new html_view_import_1.HtmlViewImportTask(opts);
                viewImportTask.process(foo, fetch);
                expect(foo.issues.length).toBe(1);
                expect(foo.issues[0].message).toBe("imported view-only template when view-model exists");
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

//# sourceMappingURL=html-view-import.spec.js.map
