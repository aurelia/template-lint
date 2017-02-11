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
const resource_1 = require("../../dist/resource");
const resource_collection_1 = require("../../dist/resource-collection");
const source_process_1 = require("../../dist/tasks/source-process");
const source_config_1 = require("../../dist/tasks/source-config");
const reflection_1 = require("../../dist/reflection");
describe("Task: Source Config Analysis", () => {
    describe("Basic", () => {
        it("should resolve call to globalResources with array and register global-resources", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                let indexPath = "./index.ts";
                let indexFile = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: indexPath,
                    content: `
          export function configure(config){
             config.globalResources(['./foo'])
          }`
                });
                let fooPath = './foo.ts';
                let fooFile = new index_2.File({
                    kind: index_2.FileKind.Source,
                    path: fooPath,
                    content: `
          export class FooCustomElement{
          }`,
                    resources: [{ name: "foo", kind: resource_1.ResourceKind.CustomElement }]
                });
                let opts = new index_1.Options();
                let ref = new reflection_1.Reflection();
                let globals = new resource_collection_1.ResourceCollection();
                let setup = new source_process_1.SourceProcessTask(opts, ref);
                let task = new source_config_1.SourceConfigTask(opts, globals);
                yield setup.process(indexFile, (_) => __awaiter(this, void 0, void 0, function* () { return undefined; }));
                yield task.process(indexFile, (_) => __awaiter(this, void 0, void 0, function* () { return fooFile; }));
                expect(globals.length).toBe(1);
                expect(globals.getResourceByIndex(0)).toBeDefined();
                expect(globals.getResourceByIndex(0).name).toBe("foo");
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

//# sourceMappingURL=source-config.spec.js.map
