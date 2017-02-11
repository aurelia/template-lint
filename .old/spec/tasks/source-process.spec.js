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
const source_process_1 = require("../../dist/tasks/source-process");
const reflection_1 = require("../../dist/reflection");
const ts = require("typescript");
describe("Task: Source Processing", () => {
    describe("When: file added to reflection", () => {
        it("Then: 'fileExists' returns true", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `export class Foo{
            field:number = 10;
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let task = new source_process_1.SourceProcessTask(opts, ref);
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                expect(ref.host.fileExists(filePath)).toBeTruthy();
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("Then: 'getFileNames' returns normalised file name", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `export class Foo{
            field:number = 10;
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let task = new source_process_1.SourceProcessTask(opts, ref);
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                let names = ref.getFileNames();
                expect(names.length).toBe(2);
                expect(names[0]).toBe("lib.d.ts");
                expect(names[1]).toBe("foo.ts");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("Then: 'getSourceFile returns valid source'", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `export class Foo{
            field:number = 10;
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let task = new source_process_1.SourceProcessTask(opts, ref);
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                var source = ref.host.getSourceFile(filePath, ts.ScriptTarget.Latest);
                expect(source).toBeDefined();
                expect(source.statements.length).toBe(1);
                expect(source.statements[0].kind).toBe(ts.SyntaxKind.ClassDeclaration);
                expect(source.statements[0].name.getText()).toBe("Foo");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("Then: 'getSourceFile returns valid source'", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `export class Foo{
            field:number = 10;
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let task = new source_process_1.SourceProcessTask(opts, ref);
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                expect(ref.host.getSourceFile(filePath, ts.ScriptTarget.Latest)).toBeDefined();
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

//# sourceMappingURL=source-process.spec.js.map
