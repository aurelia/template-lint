
import {Linter, Rule, ParseState} from 'template-lint';
import {SlotRule} from '../source/rules/slot';

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

  it("will reject slot elements inside template controllers", (done) => {

    linter.lint(`
      <div if.bind='addMe'><!-- repeat.for attribute should trigger failure as well -->
        <div><!-- should reject even if slot is wrapped with some element that is descendant of template controller -->
          <slot>INVALID - slot inside of an if.bind cannot work because slots themselves have to be statically known</slot>
        </div>
      </div>
      `)
      .then((issues) => {
        expect(issues.length).toBe(1);
        done();
      });
  });
});
