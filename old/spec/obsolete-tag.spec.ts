import { Linter } from '../source/linter';
import { ObsoleteTagRule } from '../source/rules/obsolete-tag';

describe("ObsoleteTag Rule", () => {

  var linter: Linter = new Linter([
    new ObsoleteTagRule([{ tag: "my-tag" }]),
  ]);

  it("will reject obsolete element", (done) => {
    linter.lint('<my-tag></my-tag>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("<my-tag> is obsolete");
        done();
      });
  });

  it("will allow non-obsolete element", (done) => {
    linter.lint('<my-tag2></my-tag2>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBe(0);
        done();
      });
  });
});
