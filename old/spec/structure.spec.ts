import { Linter } from '../source/linter';
import { StructureRule } from '../source/rules/structure';

describe("Parser Rule", () => {

  var linter: Linter = new Linter([
    new StructureRule(),
  ]);

  it("will reject unclosed element", (done) => {
    linter.lint('<template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will reject nested unclosed element", (done) => {
    linter.lint('<template><div></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will reject nested misnamed closing element", (done) => {
    linter.lint('<template><div></dvi></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will reject multiple nested closing element (multiple)", (done) => {
    linter.lint('<template><div><div><div></div></div></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will accept unclosed void elements", (done) => {
    linter.lint('<template><img></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("will reject unclosed non-void elements", (done) => {
    linter.lint('<template><boo></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will reject end-tag for void elements", (done) => {
    linter.lint('<template><img></img></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });
});
