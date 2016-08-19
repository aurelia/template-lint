
import { Linter, Rule } from 'template-lint';
import { SlotRule } from '../source/rules/slot';

describe("Slot Rule", () => {

    var linter: Linter = new Linter([
        new SlotRule()
    ]);

    it("will reject duplicate default slot", (done) => {
        linter.lint('<slot></slot><slot></slot>')
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("more than one default slot detected");
                done();
            });
    });

    it("will reject duplicate named slot", (done) => {
        linter.lint("<slot name='foo'></slot><slot name='foo'></slot><slot></slot>")
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toBe("duplicated slot name (foo)");
                done();
            });
    });

    it("will accept multiple slots with different names", (done) => {

        linter.lint("<slot name='boo'></slot><slot name='foo'></slot><slot></slot>")
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("will accept slots with content", (done) => {

        linter.lint("<slot> hello world </slot>")
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("will accept slots with template controllers in slot content", (done) => {

        linter.lint(`
      <slot>
        <div if.bind='addMe'>valid</div>
        <div repeat.for="item of items">also valid</div>
      </slot>`)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("will reject slot elements inside if.bind template controller", (done) => {

        linter.lint(`
      <div if.bind="">
        <div>
          <slot></slot>
        </div>
      </div>
      `)
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toContain("slot cannot have ancestor using")
                done();
            });
    });

    it("will reject slot elements inside repeat.for template controllers", (done) => {

        linter.lint(`
      <div repeat.for="">
        <div>
          <slot></slot>
        </div>
      </div>
      `)
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toContain("slot cannot have ancestor using")
                done();
            });
    });

    it("will reject slot elements inside with.bind template controllers", (done) => {

        linter.lint(`
      <div with.bind="">
        <div>
          <slot></slot>
        </div>
      </div>
      `)
            .then((issues) => {
                expect(issues.length).toBe(1);
                expect(issues[0].message).toContain("slot cannot have ancestor using")
                done();
            });
    });

    it("will accept slot element outside of template controllers", (done) => {

        linter.lint(`
      <div if.bind=""></div>
      <div repeat.for=""></div>
      <div with.bind=""></div>
      <slot></slot>
      `)
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });
});
