
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

  let viewModel =
    `
  import {Person} from './person';
  export class FooViewModel
  {    
    person:Person
  }
  `

  let view =
    `
  <template>
    <input value.bind="peron.name"></input>
    <div>
       \${peron.nam}
       \${person.nam}
       \${person.address.poscoe}
    </div>
  </template>
  `

  reflection.add("./person.ts", person);
  reflection.add("./address.ts", address);
  reflection.add("./foo.ts", viewModel);

  var linter: Linter = new Linter([
    new StaticTypeRule(reflection)
  ]);

  it("raises issues if binding paths cannot be found", async (done) => {
    try {
      var issues = await linter.lint(view, "foo.html")

      expect(issues.length).toBe(4);

      if (issues.length == 1)
        expect(issues[0].message).toBe("cannot find 'peron' in type 'FooViewModel'");
      if (issues.length == 2)
        expect(issues[1].message).toBe("cannot find 'peron' in type 'FooViewModel'");
      if (issues.length == 3)
        expect(issues[2].message).toBe("cannot find 'nam' in type 'Person'");
      if (issues.length == 4)
        expect(issues[4].message).toBe("cannot find 'poscoe' in type 'Address'");
    }
    catch (error) {
      console.log(error);
    }
    finally {
      done();
    }
  });
});