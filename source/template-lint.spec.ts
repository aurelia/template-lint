/// <reference path="template-lint.ts" />
import {
  Linter, 
  SelfCloseRule, 
  TemplateRule, 
  RouterRule,
  RequireRule} from '../dist/template-lint';

describe("SelfClose Rule", () => {

  var linter: Linter = new Linter([
    new SelfCloseRule()
  ]);

  it("will reject self-closed template", (done) => {
    linter.lint('<template/>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will reject self-closed non-void", (done) => {
    linter.lint('<template><div/></template>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will reject self-closed custom-element", (done) => {
    linter.lint('<template><custom-element/></template>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });

  it("will allow self-closed void elements", (done) => {

    linter.lint('<template><br/></template>')
      .then((errors) => {
        expect(errors.length).toBe(0);
        done();
      });
  });
});





describe("Template Rule", () => {

  var linter: Linter = new Linter([
    new TemplateRule()
  ]);
  
  it("will accept template root element", (done) => {
    linter.lint('<temslat></temslat>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });
  
  it("will reject non-template root element", (done) => {
    linter.lint('<template></template>')
      .then((errors) => {
        expect(errors.length).toBe(0);
        done();
      });
  });
  
  it("will reject more than one template", (done) => {
    linter.lint('<template></template><template></template>')
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



describe("Router Rule", () => {

  var linter: Linter = new Linter([
    new RouterRule()
  ]);
  
  
  it("will reject router-view with tag contents", (done) => {
    linter.lint('<template><router-view><br/></router-view></template>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });
});


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

describe("Linter Default", () => {

  var linter: Linter = new Linter();  
    
  it("will reject require elements without a from attribute", (done) => {
    linter.lint('<template><require fgh="something"></require></template>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });  
  
  it("will reject self-closed template", (done) => {
    linter.lint('<template/>')
      .then((errors) => {
        expect(errors.length).toBeGreaterThan(0);
        done();
      });
  });
});