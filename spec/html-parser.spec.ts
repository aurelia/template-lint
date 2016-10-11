import { Project } from '../source/index';
import { Options } from '../source/index';
import { File, FileKind } from '../source/index';
import { HtmlParseTask } from '../source/tasks/html-parse';
import { ASTElementNode } from "../source/ast/ast-element-node";
import { ASTNode } from "../source/ast/ast-node";

/**
 * Parser Task Tests
 */
describe("Task: Html Parse", () => {

  /**
   * Parser Traversal State Tests
   */
  describe("Traversal State", () => {
    it("should create an issue when non-void element is not closed", async (done) => {
      try {
        var opts = <Options>{};
        var task = new HtmlParseTask(opts);

        var file = new File({
          content: "<template>",
          path: "foo.html",
          kind: FileKind.Html
        });

        await task.process(file);

        const issues = file.issues;

        expect(issues).toBeDefined();
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("suspected unclosed element detected");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
    it("should create an issue when closing-element doesn't match open element", async (done) => {
      try {
        var opts = <Options>{};
        var task = new HtmlParseTask(opts);

        var file = new File({
          content: "<template></div>",
          path: "foo.html",
          kind: FileKind.Html
        });

        await task.process(file);

        const issues = file.issues;

        expect(issues).toBeDefined();
        expect(issues.length).toBe(2);
        expect(issues[0].message).toBe("mismatched close tag");
        expect(issues[1].message).toBe("suspected unclosed element detected");        

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });


  /**
   * AST Generation Hook Tests
   */
  describe("Hook: AST Generator", () => {
    it("should generate AST node in file result", async (done) => {
      try {
        var opts = <Options>{};
        var task = new HtmlParseTask(opts);

        var file = new File({
          content: "<template></template>",
          path: "foo.html",
          kind: FileKind.Html
        });

        await task.process(file);

        const ast: ASTNode = file["ast"];
        const astNodes = ast.children;
        const rootNode = <ASTElementNode>astNodes[0];

        expect(ast).toBeDefined();
        expect(astNodes.length).toBe(1);
        expect(rootNode.name).toBe("template");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });

  /**
   * Self-Close Hook Tests
   */
  describe("Hook: Self Close", () => {
    it("should create an issue for non-void self-closing element", async (done) => {
      try {
        var opts = <Options>{};
        var task = new HtmlParseTask(opts);

        var file = new File({
          content: "<template/>",
          path: "foo.html",
          kind: FileKind.Html
        });

        await task.process(file);

        const issues = file.issues;

        expect(issues).toBeDefined();
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("self-closing element");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
