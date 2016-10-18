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
        var opts = new Options();

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
    it("should create an issue when 'from' value is empty", async (done) => {
      try {
        var opts = new Options();

        var file = new File({
          content: '<template><require from></require></template>',
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
        expect(issues[0].message).toBe("'from' cannot be empty");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });

  describe("Fetch", () => {
    it("should be called with require's 'from' path value", async (done) => {
      try {
        var opts = new Options();

        var file = new File({
          content: '<template><require from="foo"></require></template>',
          path: "foo.html",
          kind: FileKind.Html
        });

        var html = new HtmlParseTask(opts);
        var task = new HtmlRequireTask(opts);

        var fetchExpected = new File({ content: "", kind: FileKind.Html });
        var fetchCount = 0;
        var fetchRequest = "";

        await html.process(file);
        await task.process(file, async (path) => {
          fetchCount += 1;
          fetchRequest = path;
          return fetchExpected;
        });

        expect(fetchCount).toBe(1);
        expect(fetchRequest).toBe("foo.ts");
        expect(file.imports["foo"]).toBeDefined();
        expect(file.imports["foo"].file).toBe(fetchExpected);

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should call fetch with absolute path", async (done) => {
      try {
        var opts = new Options();

        var fooFile = new File({
          content: '<template><require from="../bar.html"></require></template>',
          path: "some/path/to/foo.html",
          kind: FileKind.Html
        });

        var barFile = new File({
          content: '',
          path: "some/path/bar.html",
          kind: FileKind.Html
        });

        var html = new HtmlParseTask(opts);
        var task = new HtmlRequireTask(opts);

        var fetchExpected = barFile;
        var fetchCount = 0;
        var fetchRequest = "";

        await html.process(fooFile);
        await task.process(fooFile, async (path) => {
          fetchCount += 1;
          fetchRequest = path;
          return barFile;
        });

        expect(fetchCount).toBe(1);
        expect(fetchRequest).toBe("some/path/bar.html");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should normalise window-style paths and fetch postix style", async (done) => {
      try {
        var opts = new Options();

        var fooFile = new File({
          content: '<template><require from="..\\bar.html"></require></template>',
          path: "some\\path\\to\\foo.html",
          kind: FileKind.Html
        });

        var barFile = new File({
          content: '',
          path: "some\\path\\bar.html",
          kind: FileKind.Html
        });

        var html = new HtmlParseTask(opts);
        var task = new HtmlRequireTask(opts);

        var fetchExpected = barFile;
        var fetchCount = 0;
        var fetchRequest = "";

        await html.process(fooFile);
        await task.process(fooFile, async (path) => {
          fetchCount += 1;
          fetchRequest = path;
          return barFile;
        });

        expect(fetchCount).toBe(1);
        expect(fetchRequest).toBe("some/path/bar.html");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });


    it("should create an issue when fetch returns undefined", async (done) => {
      try {
        var opts = new Options();
        opts["report-html-require-not-found"] = true;

        var file = new File({
          content: '<template><require from="bar"></require></template>',
          path: "foo.html",
          kind: FileKind.Html
        });

        var html = new HtmlParseTask(opts);
        var task = new HtmlRequireTask(opts);

        await html.process(file);
        await task.process(file, async (path) => undefined);

        const issues = file.issues;

        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("cannot find bar");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should append source extension if missing", async (done) => {
      try {
        var opts = new Options();
        opts["source-ext"] = "js";

        var fooFile = new File({
          content: '<template><require from=".\\..\\bar"></require></template>',
          path: ".\\some\\path\\to\\foo.html",
          kind: FileKind.Html
        });

        var barFile = new File({
          content: '',
          path: "some\\path\\bar",
          kind: FileKind.Source
        });

        var html = new HtmlParseTask(opts);
        var task = new HtmlRequireTask(opts);

        var fetchExpected = barFile;
        var fetchCount = 0;
        var fetchRequest = "";

        await html.process(fooFile);
        await task.process(fooFile, async (path) => {
          fetchCount += 1;
          fetchRequest = path;
          return barFile;
        });

        expect(fetchCount).toBe(1);
        expect(fetchRequest).toBe("some/path/bar.js");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

  });

  describe("Triage", () => {
    it("should ignore any loader", async (done) => {
      try {
        var opts = new Options();
        opts["source-ext"] = "js";

        var fooFile = new File({
          content: '<template><require from="./bar!text"></require></template>',
          path: "foo.html",
          kind: FileKind.Html
        });

        var html = new HtmlParseTask(opts);
        var task = new HtmlRequireTask(opts);

        var fetchCount = 0;

        await html.process(fooFile);
        await task.process(fooFile, async (path) => {
          fetchCount += 1;
        });

        expect(fetchCount).toBe(0);

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
