import { Linter } from '../source/linter';
import { ValidChildRule } from '../source/rules/valid-child';

describe("ValidChild Rule", () => {
  it("will reject element if it isn't in allowed list", (done) => {
    var linter: Linter = new Linter([
      new ValidChildRule([{
        element: "tr", allow: ["td", "th"]
      }])
    ]);

    linter.lint('<template><tr><div></div></tr></template>')
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("<div> as child of <tr> is not allowed");
        done();
      });
  });
  it("will reject element if it is excluded", (done) => {
    var linter: Linter = new Linter([
      new ValidChildRule([{
        element: "tr", exclude: ["div", "template"]
      }])
    ]);

    linter.lint('<template><tr><template></template></tr></template>')
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("<template> as child of <tr> is not allowed");
        done();
      });
  });
});
