import { Project } from '../source/index';
import { Options } from '../source/index';
import { File, FileKind } from '../source/index';
import { HtmlParseTask} from '../source/tasks/html-parse';
import {ASTElementNode} from "../source/ast/ast-element-node";
import {ASTNode} from "../source/ast/ast-node";

describe("Task: Parser", () => {
  describe("Hook: AST Generator", () => {
    it("should generate AST node in file result", async (done) => {
      try {
        var opts = <Options>{};
        var project = new Project();

        project.use(new HtmlParseTask(opts));

        var file = new File({ 
          content: "<template></template>", 
          path: "foo.html",
          kind: FileKind.Html 
        });

        var result = await project.process(file);

        var ast: ASTNode = result["ast"];
        expect(ast).toBeDefined();
        const astNodes = ast.children;
        expect(astNodes.length).toBe(1);
        const rootNode = <ASTElementNode>astNodes[0];
        expect(rootNode.name).toBe("template");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
