import { Linter } from '../source/linter';
import { SelfCloseRule } from '../source/rules/self-close';

describe("SelfClose Rule", () => {

  var linter: Linter = new Linter([
    new SelfCloseRule()
  ]);

  it("will allow self-close within svg scope", (done) => {
    linter.lint('<template><svg><rect/></svg></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("will reject self-close on svg", (done) => {
    linter.lint('<template><svg/></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will allow self-close within math scope", (done) => {
    linter.lint('<template><math><plus/></math></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("will reject self-close on math", (done) => {
    linter.lint('<template><math/></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will reject self-closed template", (done) => {
    linter.lint('<template/>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will reject self-closed non-void", (done) => {
    linter.lint('<template><div/></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will reject self-closed custom-element", (done) => {
    linter.lint('<template><custom-element/></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will allow self-closed void elements", (done) => {

    linter.lint('<template><br/></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("will allow un-closed void elements", (done) => {
    linter.lint('<template><br></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("will give start and end offets for issues", (done) => {
    linter.lint('<template><custom-element/></template>')
      .then((result) => {
        var issues = result.issues;
        expect(issues.length).toBe(1);
        expect(issues[0].start).toBe(10);
        expect(issues[0].end).toBe(27);
        done();
      });
  });
});
