
import {Linter, Rule} from 'template-lint';
import {RequireRule} from '../source/rules/require';

describe("Require Rule", () => {

  var linter: Linter = new Linter([
    new RequireRule()
  ]);

  it("will pass require elements with a from attribute", (done) => {
    linter.lint('<template><require from="something"></require></template>')
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("will reject require elements without a from attribute", (done) => {
    linter.lint('<template><require fgh="something"></require></template>')
      .then((issues) => {
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });
});