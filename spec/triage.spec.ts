
import {Linter, Rule} from 'template-lint';
import {SyntaxRule} from '../source/rules/syntax';
import {Reflection} from '../source/reflection';
import {ASTNode} from '../source/ast';

/* Triage - Make sure stuff doesn't blow-up for the time-being. */
describe("Triage", () => {

  it("it will silently ignore unknown converters", (done) => {
    let viewmodel = `
    export class Foo {
        value: string;
    }`
    let view = `
    <template>
      \${value | booboo}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      })
  });

  it("it will silently ignore any-typed fields", (done) => {
    let viewmodel = `
    export class Foo {
        value: any;
    }`
    let view = `
    <template>
      \${value.not.checked}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      })
  });

  it("it will silently ignore literal-typed fields", (done) => {
    let viewmodel = `
    export type Moo = "moo";
    export class Foo {
        value: Moo;
    }`
    let view = `
    <template>
      \${value.not.checked}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      })
  });

  it("it will silently ignore function-typed fields", (done) => {
    let viewmodel = `
    export class Foo {
        value: ()=>void;
    }`
    let view = `
    <template>
      \${value.not.checked}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./path/foo.ts", viewmodel);
    linter.lint(view, "./path/foo.html")
      .then((issues) => {
        expect(issues.length).toBe(0);
        done();
      })
  });

  //#58
  it("it will silently ignore access to array fields", (done) => {
    let item = `
    export interface Item{
      value:string;
    }`;

    let viewmodel = `
    import {Item} from './item
    export class Foo{
      items: Item[];
    }`
    let view = `
    <template>    
      \${items.length}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./item", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        } finally { fail(); done(); }
      })
  });
});