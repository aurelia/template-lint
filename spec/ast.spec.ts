
import {Linter, Rule} from 'template-lint';
import {SyntaxRule} from '../source/rules/syntax';
import {Reflection} from '../source/reflection';
import {ASTNode, ASTContext} from '../source/ast';

describe("Abstract Syntax Tree", () => {
  it("inheritLocals returns all unique locals from self and parents", () => {

      let a = new ASTNode({locals:[new ASTContext({name:"item"})]});
      let b = new ASTNode({locals:[new ASTContext({name:"parent"})]});
      a.addChild(b);
      
      let locals = ASTNode.inheritLocals(b);

      expect(locals.length).toBe(2);
      expect(locals[0].name).toBe("parent");      
      expect(locals[1].name).toBe("item");
  });
  
  it("inheritLocals returns deepest duplicate-name locals", () => {

      let a = new ASTNode({locals:[new ASTContext({name:"item", type:"number"})]});
      let b = new ASTNode({locals:[new ASTContext({name:"item", type:"string"})]});

      a.addChild(b);
      
      let locals = ASTNode.inheritLocals(b);

      expect(locals.length).toBe(1);
      expect(locals[0].name).toBe("item");
      expect(locals[0].type).toBe("string");
  });
});