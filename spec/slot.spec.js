"use strict";
const template_lint_1 = require('template-lint');
const slot_1 = require('../dist/slot');
describe("Slot Rule", () => {
    var linter = new template_lint_1.Linter([
        new slot_1.SlotRule()
    ]);
    it("will reject duplicate default slot", (done) => {
        linter.lint('<slot></slot><slot></slot>')
            .then((errors) => {
            expect(errors.length).toBe(1);
            expect(errors[0].message).toBe("more than one default slot detected");
            done();
        });
    });
    it("will reject duplicate named slot", (done) => {
        linter.lint("<slot name='foo'></slot><slot name='foo'></slot><slot></slot>")
            .then((errors) => {
            expect(errors.length).toBe(1);
            expect(errors[0].message).toBe("duplicated slot name (foo)");
            done();
        });
    });
    it("will accept multiple slots with different names", (done) => {
        linter.lint("<slot name='boo'></slot><slot name='foo'></slot><slot></slot>")
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
    it("will accept slots with content", (done) => {
        linter.lint("<slot> hello world </slot>")
            .then((errors) => {
            expect(errors.length).toBe(0);
            done();
        });
    });
});

//# sourceMappingURL=slot.spec.js.map
