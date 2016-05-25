/// <reference path="../dist/template-lint.d.ts" />
import {TemplateLint} from '../dist/template-lint';

describe("A suite",  ()=> {
  it("contains spec with an expectation", () => {
    
    var lint:TemplateLint = new TemplateLint();
    
    expect(lint.pass()).toBe(true);
  });
});

