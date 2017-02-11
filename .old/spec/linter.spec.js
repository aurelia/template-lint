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
describe("Linter", () => {
    describe("Process Example", () => {
        it("should return the result for file", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var config = new index_1.Config();
                config.basepath = "./";
                config.typings = "./example/**/*.d.ts";
                config.source = "./example/**/*.ts";
                config.markup = "./example/**/*.html";
                var linter = new index_1.Linter(config);
                yield linter.init();
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

//# sourceMappingURL=linter.spec.js.map
