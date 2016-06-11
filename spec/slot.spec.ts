
import {Linter, Rule, ParseState, RuleError} from 'template-lint';
import {SlotRule} from '../source/rules/slot';

describe("Slot Rule", () => {

  var linter: Linter = new Linter([
    new SlotRule()
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