
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

  it("accepts good interpolation binding", (done) => {
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



  it("rejects bad interpolation binding", (done) => {
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

    it("accepts good attribute binding", (done) => {
    let viewmodel = `
    export class Foo{
      name:string
    }`
    let view = `
    <template>
      <input type="text" value.bind="name">
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
    let viewmodel = `
    export class FooCamel{
      name:string
    }`
    let view = `
    <template>
      <input type="text" value.bind="name">
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo-camel.ts", viewmodel);
    linter.lint(view, "./foo-camel.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(0);
        } 
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });

  it("supports generics", (done) => {
    
    let cat = `
    export class Cat{
      color:string;      
    }`;
    let person = `
    export class Person<T>{
      name:string;
      pet:T;
    }`;

    let viewmodel = `
    import {Person} from './path/person'
    import {Cat} from './path/cat'
    export class Foo{
      person:Person<Cat>
    }`
    let view = `
    <template>
      \${person}
      \${person.pet}      
      \${person.pet.color}        
      \${person.pet.colr}
    </template>`
    let reflection = new Reflection();
    let rule = new SyntaxRule(reflection);
    let linter = new Linter([rule]);
    reflection.add("./foo.ts", viewmodel);
    reflection.add("./path/person.ts", person);    
    reflection.add("./path/cat.ts", cat);
    linter.lint(view, "./foo.html")
      .then((issues) => {
        try {
          expect(issues.length).toBe(2);
          expect(issues[0].message).toBe("cannot find 'colr' in type 'Pet'")
          expect(issues[1].message).toBe("cannot find 'corl' in type 'Pet'")
        } 
        catch(error){expect(error).toBeUndefined()}
        finally { done(); }
      })
  });
});