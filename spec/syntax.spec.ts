
import {Linter, Rule} from 'template-lint';
import {SyntaxRule} from '../source/rules/syntax';
import {Reflection} from '../source/reflection';
import {ASTNode} from '../source/ast';

describe("BindingSyntax Rule", () => {

  it("will fail bad repeat.for syntax", (done) => {
    var linter: Linter = new Linter([
      new SyntaxRule(new Reflection())
    ]);
    linter.lint('<div repeat.for="item of"></div>')
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toContain('Incorrect syntax for "for"')
        done();
      });
  });

  it("will fail bad interpolation syntax in text node", (done) => {
    var linter: Linter = new Linter([
      new SyntaxRule(new Reflection())
    ]);
    linter.lint('<div>${..}</div>')
      .then((issues) => {
        expect(issues.length).toBe(1);
        expect(issues[0].message).toContain('Parser Error')
        done();
      });
  });

  it("accepts good attribute binding", (done) => {
    let viewmodel = `
    export class Foo{
      name:string
    }`
    let view = `
    <template>
      \${name}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });

  it("rejects bad attribute binding", (done) => {
    let viewmodel = `
    export class Foo{
      name:string
    }`
    let view = `
    <template>
      \${nam}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1)
          expect(issues[0].message).toBe("cannot find 'nam' in type 'Foo'");
        }
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });

  it("accepts good attribute binding to imported type", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      item:Item
    }`
    let view = `
    <template>
      \${item.info}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        }
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });

  it("rejects bad attribute binding to imported type", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;
    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      item:Item
    }`;
    let view = `
    <template>
      \${item.infooo}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'infooo' in type 'Item'");
        }
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });

  it("accepts good with.bind attribute value", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      item:Item
    }`
    let view = `
    <template with.bind="item"></template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        } 
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });

  it("rejects bad with.bind attribute value", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      item:Item
    }`
    let view = `
    <template with.bind="itm"></template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'itm' in type 'Foo'");
        }
        catch(error){expect(error).toBeUndefined()} 
        finally { done(); }
      })
  });

  it("accepts good repeat.for attribute value", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      items:Item[]
    }`
    let view = `
    <template repeat.for="item of items">    
      \${item}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        } 
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });

  it("accepts good repeat.for attribute valid of imported interface", (done) => {
    let item = `
    export interface Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      items:Item[]
    }`
    let view = `
    <template repeat.for="item of items">
      \${item}
      \${item.info}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        } 
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });

  it("rejects bad with.bind attribute value", (done) => {
    let item = `
    export class Item{
      info:string;
    }`;

    let viewmodel = `
    import {Item} from './path/item
    export class Foo{
      items:Item[]
    }`
    let view = `
    <template repeat.for="item of itms"></template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/item.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'itms' in type 'Foo'");
        } 
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });

  it("correctly finds view-model with camel-case path", (done) => {
    let item = `
    export class CamelCase{
      info:string;
    }`;

    let viewmodel = `
    import {CamelCase} from './path/camel-case
    export class Foo{
      item:CamelCase
    }`
    let view = `
    <template><div value.bind="item.inf"></div></template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/camel-case.ts", item);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(1);
          expect(issues[0].message).toBe("cannot find 'inf' in type 'Foo'")
        } 
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });
});