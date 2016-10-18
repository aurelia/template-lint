import { Project } from '../source/index';
import { Options } from '../source/index';
import { File, FileKind, FileTask } from '../source/index';
import { HtmlParseTask } from '../source/tasks/html-parse';
import { HtmlRequireTask } from '../source/tasks/html-require';
import { HtmlViewImportTask } from '../source/tasks/html-view-import';
import { ASTElementNode } from "../source/ast/ast-element-node";
import { ASTNode } from "../source/ast/ast-node";

/**
 * HTML Template Requires
 */
describe("Task: Html View Import", () => {
  describe("Checks", () => {
    it("should create an issue when view-model exists for view-only import", async (done) => {
      try {
        var opts = new Options();

        var foo = new File({
          content: '<template><require from="./item.html"></require></template>',
          path: "./foo.html",
          kind: FileKind.Html
        });

        var itemView = new File({
          content: '<template></template>',
          path: "./item.html",
          kind: FileKind.Html
        });

        var itemViewModel = new File({
          content: 'export class Item {}',
          path: "./item.ts",
          kind: FileKind.Source
        });

        var files = [foo, itemView, itemViewModel];

        var fetch = async (path) => {
          for (var file of files) {
            if (file.path == path) {
              return file;
            }
          }
          return undefined;
        };

        var tasks = new Array<FileTask>(
          new HtmlParseTask(opts),
          new HtmlRequireTask(opts)
        );

        for (var task of tasks) {
          await task.process(foo, fetch);
        }

        var viewImportTask = new HtmlViewImportTask(opts);

        viewImportTask.process(foo, fetch);

        expect(foo.issues.length).toBe(1);
        expect(foo.issues[0].message).toBe("imported view-only template when view-model exists");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
