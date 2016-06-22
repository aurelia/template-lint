
import {Linter, Rule} from 'template-lint';
import {BindingSyntaxRule} from '../source/rules/binding-syntax';

describe("BindingSyntax Rule", () => {

  var linter: Linter = new Linter([
    new BindingSyntaxRule()
  ]);

  it("will fail bad repeat.for syntax", (done) => {
    linter.lint('<div repeat.for="item of"></div>')
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toContain('Incorrect syntax for "for"')
        done();
      });
  });
  
  it("will fail bad interpolation syntax in text node", (done) => {
    linter.lint('<div>${..}</div>')
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toContain('Parser Error')
        done();
      });
  });
});