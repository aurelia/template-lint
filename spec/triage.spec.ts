
import { Linter, Rule } from 'template-lint';
import { BindingRule } from '../source/rules/binding';
import { Reflection } from '../source/reflection';
import { AureliaReflection } from '../source/aurelia-reflection';
import { ASTNode } from '../source/ast';

/* Triage - Make sure stuff doesn't blow-up for the time-being. */
describe("Triage", () => {

  it("it will silently ignore unknown converters", (done) => {
    let viewmodel = `
    export class Foo {
        value: string;
    }`;
    let view = `
    <template>
      \${value | booboo}
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("it will silently ignore any-typed fields", (done) => {
    let viewmodel = `
    export class Foo {
        value: any;
    }`;
    let view = `
    <template>
      \${value.not.checked}
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("it will silently ignore literal-typed fields", (done) => {
    let viewmodel = `
    export class Foo {
        value: {name:string};
    }`;
    let view = `
    <template>
      \${value.not.checked}
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("it will silently ignore intersection types", (done) => {
    let types = `
    export class A{
      name: string;
    }
    export class B{
      name: string;
      value: number;
    }`;
    let viewmodel = `   
    import {A, B} from './types' 
    export class Foo {
        value:A | B;
    }`;
    let view = `
    <template>
      \${value.not.checked}
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    reflection.add("./path/types.ts", types);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("it will silently ignore union types", (done) => {
    let types = `
    export class A{
      name: string;
    }
    export class B{
      name: string;
      value: number;
    }`;
    let viewmodel = `   
    import {A, B} from './types' 
    export class Foo {
        value:A & B;
    }`;
    let view = `
    <template>
      \${value.not.checked}
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    reflection.add("./path/types.ts", types);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      });
  });

  it("it will silently ignore type alias", (done) => {
    let types = `
    class A{
      name: string;
    }
    class B{
      name: string;
      value: number;
    }
    export type C = A & B`;
    let viewmodel = `   
    import {C} from './types' 
    export class Foo {
        value:C;
    }`;
    let view = `
    <template>
      \${value.not.checked}
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    reflection.add("./path/types.ts", types);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      });
  });


  it("it will silently ignore function-typed fields", (done) => {
    let viewmodel = `
    export class Foo {
        value: ()=>void;
    }`;
    let view = `
    <template>
      \${value.not.checked}
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      });
  });

  //#58
  it("it will silently ignore access to untyped Array-object members", (done) => {
    let viewmodel = `
    export class Foo{
      items:[];
    }`;
    let view = `
    <template>    
      \${items.length}
      \${items.lengh}
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
          //expect(issues[0].message).toBe("cannot find 'lengh' in object 'Array'")
        }
        catch (err) { fail(err); }
        finally { done(); }
      });
  });

  //#77
  it("it will silently ignore replace-part attribute and element children", (done) => {
    let viewmodel = `
    export class Foo{
    }`;
    let view = `
    <template>
      <require from='./some-element'></require>
      <some-element>
        <template replace-part="item-template">
          \${item.itemName}
        </template> 
      </some-element>
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
          //expect(issues[0].message).toBe("cannot find 'lengh' in object 'Array'")
        }
        catch (err) { fail(err); }
        finally { done(); }
      });
  });

  //#77
  it("it will silently ignore slot attribute and element children", (done) => {
    let viewmodel = `
    export class Foo{
    }`;
    let view = `
    <template>
      <require from='./some-element'></require>
      <some-element>
        <template slot="item-template">
          \${item.itemName}
        </template> 
      </some-element>
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
          //expect(issues[0].message).toBe("cannot find 'lengh' in object 'Array'")
        }
        catch (err) { fail(err); }
        finally { done(); }
      });
  });

  // #145
  it("it will silently ignore no view-model class", (done) => {
    let viewmodel = `
    export function Foo() {    
    }`;
    let view = `
    <template>
      \${value.not.checked}
    </template>`;
    let reflection = new Reflection();
    let rule = new BindingRule(reflection, new AureliaReflection());
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      });
  });  
});
