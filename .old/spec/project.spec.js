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
describe("Project", () => {
    describe("Processing", () => {
        it("should return the result for file", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var project = new index_1.Project();
                var result = yield project.process(new index_2.File({ content: "", path: "foo", kind: index_2.FileKind.Source }));
                expect(result).not.toBeNull();
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should maintain the file result when file has a path", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var project = new index_1.Project();
                var expected = yield project.process(new index_2.File({ content: "", path: "foo", kind: index_2.FileKind.Source }));
                var result = project.getResult("foo");
                expect(result).toBe(expected);
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should not maintain the file result when file has not path", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var project = new index_1.Project();
                yield project.process(new index_2.File({ path: "", content: "", kind: index_2.FileKind.Source }));
                var result = project.getResult("");
                expect(result).toBeUndefined();
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

//# sourceMappingURL=project.spec.js.map
