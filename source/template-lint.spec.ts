/// <reference path="template-lint.ts" />
import {TemplateLint} from '../dist/template-lint';

describe("Template Lint", () => {

  it("can ignore proper template", (done) => {

    var lint: TemplateLint = new TemplateLint();

    lint.hasSelfCloseTags('<template></template>')
      .then(
      (result) => {
        expect(result).toBe(false);
        done();
      });
  });

  it("can detect self-closed template", (done) => {

    var lint: TemplateLint = new TemplateLint();

    lint.hasSelfCloseTags('<template/>')
      .then(
      (result) => {
        expect(result).toBe(true);
        done();
      });
  });

  it("can detect self-closed custom-element", (done) => {

    var lint: TemplateLint = new TemplateLint();

    lint.hasSelfCloseTags('<template><custom-element/></template>')
      .then(
      (result) => {
        expect(result).toBe(true);
        done();
      });
  });
});

