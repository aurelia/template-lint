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
const issue_1 = require("../../dist/issue");
const issue_sort_1 = require("../../dist/tasks/issue-sort");
describe("Task: Issue Sort", () => {
    describe("Sorting", () => {
        it("should sort issues ascending by start value", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var task = new issue_sort_1.IssueSortTask();
                var file = new index_1.File({ content: "", kind: index_1.FileKind.Html });
                file.issues.push(new issue_1.Issue({
                    message: "second",
                    severity: issue_1.IssueSeverity.Error,
                    location: new index_1.FileLocation({ line: 0, column: 0, start: 0, end: 2 })
                }));
                file.issues.push(new issue_1.Issue({
                    message: "first",
                    severity: issue_1.IssueSeverity.Error,
                    location: new index_1.FileLocation({ line: 0, column: 1, start: 1, end: 2 })
                }));
                task.process(file);
                expect(file.issues.length).toBe(2);
                expect(file.issues[0].message).toBe("first");
                expect(file.issues[1].message).toBe("second");
            }
            catch (err) {
                fail(err);
            }
            finally {
                done();
            }
        }));
        it("should place issues without location information at end", (done) => __awaiter(this, void 0, void 0, function* () {
            try {
                var task = new issue_sort_1.IssueSortTask();
                var file = new index_1.File({ content: "", kind: index_1.FileKind.Html });
                file.issues.push(new issue_1.Issue({
                    message: "second",
                    severity: issue_1.IssueSeverity.Error,
                    location: undefined
                }));
                file.issues.push(new issue_1.Issue({
                    message: "first",
                    severity: issue_1.IssueSeverity.Error,
                    location: new index_1.FileLocation({ line: 0, column: 1, start: 1, end: 2 })
                }));
                task.process(file);
                expect(file.issues.length).toBe(2);
                expect(file.issues[0].message).toBe("first");
                expect(file.issues[1].message).toBe("second");
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

//# sourceMappingURL=issue-sort.spec.js.map
