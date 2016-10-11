import { Project } from '../source/index';
import { Options } from '../source/index';
import { File, FileKind } from '../source/index';
import { HtmlParseTask } from '../source/tasks/html-parse';
import { HtmlRequireTask } from '../source/tasks/html-require';
import { ASTElementNode } from "../source/ast/ast-element-node";
import { ASTNode } from "../source/ast/ast-node";

/**
 * HTML Template Requires
 */
describe("Task: Html Require Element", () => {
  describe("Value", () => {
    it("should create an issue when 'from' missing", async (done) => {
      try {
        var opts = <Options>{};

        var file = new File({
          content: '<template><require></require></template>',
          path: "foo.html",
          kind: FileKind.Html
        });

        var html = new HtmlParseTask(opts);
        var task = new HtmlRequireTask(opts);

        await html.process(file);
        await task.process(file, async (path) => {
          return new File({ content: "", kind: FileKind.Html });
        });

        const issues = file.issues;

        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("missing a 'from' attribute");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });

  describe("Fetch", () => {
    it("should call fetch using require's from path", async (done) => {
      try {
        var opts = <Options>{};

        var file = new File({
          content: '<template><require from="bar"></require></template>',
          path: "foo.html",
          kind: FileKind.Html
        });

        var html = new HtmlParseTask(opts);
        var task = new HtmlRequireTask(opts);

        var fetchCount = 0;
        var fetchRequest = "";

        await html.process(file);
        await task.process(file, async (path) => {
          fetchCount += 1;
          fetchRequest = path;
          return new File({ content: "", kind: FileKind.Html });
        });

        expect(fetchCount).toBe(1);
        expect(fetchRequest).toBe("bar");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
