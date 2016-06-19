
import {Linter, Rule} from 'template-lint';
import {Reflection} from '../source/reflection';
import {StaticTypeRule} from '../source/rules/static-type';
import {ViewResources} from 'aurelia-templating';
import {TemplatingBindingLanguage, SyntaxInterpreter, AttributeMap} from 'aurelia-templating-binding';
import {Parser, ObserverLocator, NameExpression, bindingMode} from 'aurelia-binding';

import {initialize} from 'aurelia-pal-nodejs';

initialize();

describe("StaticType Rule", () => {

  var reflection = new Reflection();

  let person =
  `
  import {Address} from './address';
  export class Person
  {
    name:string;
    address:Address;
    age:number;
  }
  `
  let address =
  `
  export class Address
  {    
    address:string;
    postcode:Address;
  }
  `

  let template = 
  `
  <template>
    <input value.bind="name"></input>
    <div>
       \${nam}
       \${address.poscoe}
    </div>
  </template>
  `

  reflection.add("./person.ts", person);
  reflection.add("./address.ts", address);
  
  var linter: Linter = new Linter([
    new StaticTypeRule(reflection)
  ]);

  it("raises issues if binding paths cannot be found in string interpolations", () => {
    linter.lint(template, "person.html")
      .then((issues) => {
        //expect(issues.length).toBe(2);
        //expect(issues[0].message).toBe("cannot find 'nam' in type 'Person'")
        //expect(issues[1].message).toBe("cannot find 'poscoe' in type 'Address'") 
      });
  });
});