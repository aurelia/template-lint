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
const source_resources_1 = require("../../dist/tasks/source-resources");
const reflection_1 = require("../../dist/reflection");
const resource_1 = require("../../dist/resource");
const ts = require("typescript");
describe("Task: Gather Aurelia Resources", () => {
    describe("Decorators", () => {
        it("should register 'foo' as a custom element when 'customElement' decorator found", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `
          import { customElement } from 'aurelia-framework';
          @customElement("foo")
          export class Foo{
            field:number = 10;
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let setup = new source_process_1.SourceProcessTask(opts, ref);
                let task = new source_resources_1.SourceResourcesTask(opts);
                yield setup.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                if (file.isSourceFile()) {
                    let resources = file.resources;
                    expect(resources.length).toBe(1);
                    expect(resources[0].kind).toBe(resource_1.ResourceKind.CustomElement);
                    expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
                    expect(resources[0].name).toBe("foo");
                }
                else
                    fail("expected source file");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should register 'foo' as a custom attribute when 'customAttribute' decorator found", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `
          import { customAttribute } from 'aurelia-framework';
          @customAttribute("foo")
          export class Foo{
            field:number = 10;
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let setup = new source_process_1.SourceProcessTask(opts, ref);
                let task = new source_resources_1.SourceResourcesTask(opts);
                yield setup.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                if (file.isSourceFile()) {
                    let resources = file.resources;
                    expect(resources.length).toBe(1);
                    expect(resources[0].kind).toBe(resource_1.ResourceKind.CustomAttribute);
                    expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
                    expect(resources[0].name).toBe("foo");
                }
                else
                    fail("expected source file");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should register 'foo' as a value converter when 'valueConverter' decorator found", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `
          import { valueConverter } from 'aurelia-framework';
          @valueConverter("foo")
          export class Foo{
            field:number = 10;
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let setup = new source_process_1.SourceProcessTask(opts, ref);
                let task = new source_resources_1.SourceResourcesTask(opts);
                yield setup.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                if (file.isSourceFile()) {
                    let resources = file.resources;
                    expect(resources.length).toBe(1);
                    expect(resources[0].kind).toBe(resource_1.ResourceKind.ValueConverter);
                    expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
                    expect(resources[0].name).toBe("foo");
                }
                else
                    fail("expected source file");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should register 'foo' as a binding behaviour when 'bindingBehaviour' decorator found", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `
          import { bindingBehaviour } from 'aurelia-framework';
          @bindingBehaviour("foo")
          export class Foo{
            field:number = 10;
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let setup = new source_process_1.SourceProcessTask(opts, ref);
                let task = new source_resources_1.SourceResourcesTask(opts);
                yield setup.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                if (file.isSourceFile()) {
                    let resources = file.resources;
                    expect(resources.length).toBe(1);
                    expect(resources[0].kind).toBe(resource_1.ResourceKind.BindingBehaviour);
                    expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
                    expect(resources[0].name).toBe("foo");
                }
                else
                    fail("expected source file");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
    });
    describe("Name Convention", () => {
        it("should register 'foo-bar-ray' as a custom element when class name is 'FooBarRayCustomElement'", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `
          export class FooBarRayCustomElement{
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let setup = new source_process_1.SourceProcessTask(opts, ref);
                let task = new source_resources_1.SourceResourcesTask(opts);
                yield setup.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                if (file.isSourceFile()) {
                    let resources = file.resources;
                    expect(resources.length).toBe(1);
                    expect(resources[0].kind).toBe(resource_1.ResourceKind.CustomElement);
                    expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
                    expect(resources[0].name).toBe("foo-bar-ray");
                }
                else
                    fail("expected source file");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should register 'foo-bar-ray' as a custom attribute when class name is 'FooBarRayCustomAttribute'", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `
          export class FooBarRayCustomAttribute{
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let setup = new source_process_1.SourceProcessTask(opts, ref);
                let task = new source_resources_1.SourceResourcesTask(opts);
                yield setup.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                if (file.isSourceFile()) {
                    let resources = file.resources;
                    expect(resources.length).toBe(1);
                    expect(resources[0].kind).toBe(resource_1.ResourceKind.CustomAttribute);
                    expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
                    expect(resources[0].name).toBe("foo-bar-ray");
                }
                else
                    fail("expected source file");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should register 'foo-bar-ray' as a value converter when class name is 'FooBarRayValueConverter'", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `
          export class FooBarRayValueConverter{
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let setup = new source_process_1.SourceProcessTask(opts, ref);
                let task = new source_resources_1.SourceResourcesTask(opts);
                yield setup.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                if (file.isSourceFile()) {
                    let resources = file.resources;
                    expect(resources.length).toBe(1);
                    expect(resources[0].kind).toBe(resource_1.ResourceKind.ValueConverter);
                    expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
                    expect(resources[0].name).toBe("foo-bar-ray");
                }
                else
                    fail("expected source file");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should register 'foo-bar-ray' as a binding behaviour when class name is 'FooBarRayBindingBehaviour'", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let filePath = './foo.ts';
                let file = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: filePath,
                    content: `
          export class FooBarRayBindingBehaviour{
          }`
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let setup = new source_process_1.SourceProcessTask(opts, ref);
                let task = new source_resources_1.SourceResourcesTask(opts);
                yield setup.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                yield task.process(file, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                if (file.isSourceFile()) {
                    let resources = file.resources;
                    expect(resources.length).toBe(1);
                    expect(resources[0].kind).toBe(resource_1.ResourceKind.BindingBehaviour);
                    expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
                    expect(resources[0].name).toBe("foo-bar-ray");
                }
                else
                    fail("expected source file");
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

//# sourceMappingURL=source-resources.spec.js.map
