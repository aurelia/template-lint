"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const index_1 = require("../dist/index");
const index_2 = require("../dist/index");
const project_builder_1 = require("../dist/project-builder");
const conventions_1 = require("../dist/conventions");
describe("Conventions", () => {
    describe("Resolve ViewModel", () => {
        it("should resolve to exported class FooCustomElement", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let config = new index_1.Config();
                let projectBuilder = new project_builder_1.ProjectBuilder();
                let project = projectBuilder.build(config.options);
                let source = yield project.process(new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: "./foo.ts",
                    content: `export class FooCustomElement{}`
                }));
                let markup = yield project.process(new index_2.File({
                    kind: index_2.FileKind.Html,
                    path: "./foo.html",
                    content: `<template><template>`
                }));
                // TODO: need to have fetch convert `foo` to `foo.ts`
                let viewModelResolve = yield conventions_1.defaultResolveViewModel(markup, project.fetch);
                console.log(viewModelResolve);
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

//# sourceMappingURL=conventions.spec.js.map
