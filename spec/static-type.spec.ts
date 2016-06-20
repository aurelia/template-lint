
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
  import {Address} from '../address';
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
    <input value.bind="peron.age"></input>
    <div>
       \${peron.nam}
       \${person.nam}
       \${person.address.poscoe}
    </div>
  </template>
  `

  reflection.add("./dir/person.ts", person);
  reflection.add("./address.ts", address);
  reflection.add("./dir/foo.ts", viewModel);

  var linter: Linter = new Linter([
    new StaticTypeRule(reflection)
  ]);

  it("raises issues if binding paths cannot be found", async (done) => {
    try {
      var issues = await linter.lint(view, "./dir/foo.html")

      expect(issues.length).toBe(4);

      expect(issues[0].message).toBe("cannot find 'peron' in type 'FooViewModel'");
      expect(issues[1].message).toBe("cannot find 'peron' in type 'FooViewModel'");
      expect(issues[2].message).toBe("cannot find 'nam' in type 'Person'");
      expect(issues[3].message).toBe("cannot find 'poscoe' in type 'Address'");
    }
    catch (error) {
      expect(error).toBeUndefined();
    }
    finally {
      done();
    }
  });
});