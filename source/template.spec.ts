
import {Linter, Rule, ParseState, RuleError} from 'template-lint';
import {TemplateRule, ProjectionRule, RequireRule} from '../dist/index';

describe("Template Rule", () => {

  var linter: Linter = new Linter([
    new TemplateRule()
  ]);
  
    it("will accept template root element", (done) => {
    linter.lint('<template></template>')
      .then((errors) => {
        
        errors.forEach(element => {
          console.log(element);
        });
        
        expect(errors.length).toBe(0);
        done();
      });
  });
  
  it("will reject non-template root element", (done) => {
    linter.lint('<temslat></temslat>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });
  
  it("will ignore html non-template root element", (done) => {
    linter.lint('<temslat></temslat>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });
  
  it("will reject more than one template", (done) => {
    linter.lint('<template></template><template></template>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  })
  
  it("will reject nested template", (done) => {
    linter.lint('<template><template></template></template>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });
  
  it("will pass template with valid contents", (done) => {
    linter.lint('<template><button></button><div></div></template>')
      .then((errors) => {
        expect(errors.length).toBe(0);
        done();
      });
  });
});