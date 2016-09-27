"use strict";

import { Linter, Rule } from 'template-lint';
import { Config } from '../source/config';
import { AureliaLinter } from '../source/aurelia-linter';
import { BindingRule } from '../source/rules/binding';
import { Reflection } from '../source/reflection';
import { initialize } from 'aurelia-pal-nodejs';

initialize();

describe("Failing Scenarios", () => {
  //uncomment, add your example and what you expect. 
  
  it("#117 - bad namespace", (done) => {
    var config: Config = new Config();
    var linter: AureliaLinter = new AureliaLinter(config);
    var html = `
    <svg if.bind="!userContext.imageUri" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" style="width:20px;height:20px;">
     <circle cx="20" cy="20" r="18" stroke="grey" stroke-width="1" fill="#FFFFFF" /> 
     <text x="50%" y="50%" text-anchor="middle" stroke="#51c5cf" stroke-width="2px" dy=".3em" letter-spacing="2">
     \${userContext.caps}</text> 
     </svg>
    `;
    linter.lint(html)
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch (err) { fail(err); }
        finally { done(); }
      });
  });
  
});
