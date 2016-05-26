/// <reference path="template-lint.ts" />
import {Linter} from '../dist/template-lint';

describe("Linter", () => {
  
  it("can resolve proper template", (done) => {

    var linter: Linter = new Linter();

    linter.lint('<template></template>')
      .then(
      (result) => {
        expect(result).toBe(true);
        done();
      });
  });

  it("can reject self-closed template", (done) => {

    var linter: Linter = new Linter();

    linter.lint('<template/>')
      .then(
      (result) => {
        expect(result).toBe(false);
        done();
      });
  });

  it("can reject self-closed custom-element", (done) => {

    var linter: Linter = new Linter();

    linter.lint('<template><custom-element/></template>')
      .then(
      (result) => {
        expect(result).toBe(false);
        done();
      });
  });
});

