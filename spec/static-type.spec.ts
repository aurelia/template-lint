import {Linter, Rule} from 'template-lint';
import {Reflection} from '../source/reflection';
import {StaticTypeRule} from '../source/rules/static-type';
import {ViewResources} from 'aurelia-templating';
import {TemplatingBindingLanguage, SyntaxInterpreter, AttributeMap} from 'aurelia-templating-binding';
import {Parser, ObserverLocator, NameExpression, bindingMode} from 'aurelia-binding';
import fs = require('fs');
import {initialize} from 'aurelia-pal-nodejs';

initialize();

describe("StaticType Rule", () => {
  describe("with Manual Reflection", () => {

    var reflection = new Reflection();

    let item = `   
    export class Item
    {
      name:string;
    }`

    let person = `
    import {Address} from '../address';
    export class Person
    {
      name:string;
      address:Address;
      age:number;
    }
    `
    let address = `
    export class Address
    {    
      address:string;
      postcode:Address;
    }
    `

    let viewModel = `
    import {Person} from './person';
    import {Item} from './nested/item'
    export class FooViewModel
    {    
      person:Person
      items:Item[];
    }
    `

    let view = `
    <template>
      <input value.bind="peron.age"></input>
      <div>
        \${peron.nam}
        \${person.nam}
        \${person.address.poscoe}
      </div>
      <div repeat.for="item of ites">
      </div>

      <table>
        <tr repeat.for="item of items">
          <td>\${itm.name}</td>
          <td>\${item.nme}</td>
        </tr>
      </table>
    </template>
    `
    reflection.add("./dir/nested/item.ts", item);
    reflection.add("./dir/person.ts", person);
    reflection.add("./address.ts", address);
    reflection.add("./dir/foo.ts", viewModel);

    var linter: Linter = new Linter([
      new StaticTypeRule(reflection)
    ]);

    it("raises issues if binding paths cannot be found", async (done) => {
      try {
        var issues = await linter.lint(view, "./dir/foo.html")

        expect(issues.length).toBe(7);

        expect(issues[0].message).toBe("cannot find 'peron' in type 'FooViewModel'");
        expect(issues[1].message).toBe("cannot find 'peron' in type 'FooViewModel'");
        expect(issues[2].message).toBe("cannot find 'nam' in type 'Person'");
        expect(issues[3].message).toBe("cannot find 'poscoe' in type 'Address'");        
        expect(issues[4].message).toBe("cannot find 'ites' in type 'FooViewModel'");
        expect(issues[5].message).toBe("cannot find 'itm' in type 'FooViewModel'");
        expect(issues[6].message).toBe("cannot find 'nme' in type 'Item'");
      }
      catch (error) {
        expect(error).toBeUndefined();
      }
      finally {
        done();
      }
    });
  });


  describe("with Directory Glob Reflection", () => {
    it("raises issues if binding paths cannot be found", async (done) => {
      var reflection = new Reflection();

      await reflection.addGlob("example/**/*.ts");
      var viewPath = "./example/foo.html";
      let view = fs.readFileSync(viewPath, 'utf8');

      var linter: Linter = new Linter([
        new StaticTypeRule(reflection)
      ]);

      try {
        var issues = await linter.lint(view, viewPath)

        expect(issues.length).toBe(5);

        expect(issues[0].message).toBe("cannot find 'ino' in type 'Item'");
        expect(issues[1].message).toBe("cannot find 'isAdmn' in type 'Role'");
        expect(issues[2].message).toBe("cannot find 'sizeee' in type 'Data'");
        expect(issues[3].message).toBe("cannot find 'postcdo' in type 'Address'");
        expect(issues[4].message).toBe("cannot find 'nme' in type 'Item'");
      }
      catch (error) {
        expect(error).toBeUndefined();
      }
      finally {
        done();
      }
    });
  });
});