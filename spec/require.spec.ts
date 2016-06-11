
import {Linter, Rule, ParseState, RuleError} from 'template-lint';
import {RequireRule} from '../source/require';

describe("Require Rule", () => {

  var linter: Linter = new Linter([
    new RequireRule()
  ]);  
  
   it("will pass require elements with a from attribute", (done) => {
    linter.lint('<template><require from="something"></require></template>')
      .then((errors) => {
        expect(errors.length).toBe(0);
        done();
      });
  });
  
  it("will reject require elements without a from attribute", (done) => {
    linter.lint('<template><require fgh="something"></require></template>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });  
});