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
        var opts = new Options();
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
        var opts = new Options();
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
        var opts = new Options();
        var task = new HtmlParseTask(opts);

        var file = new File({
          content: "<template></template>",
          path: "foo.html",
          kind: FileKind.Html
        });

        await task.process(file);

        const ast: ASTNode = file["ast"];

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

  /**
   * Self-Close Hook Tests
   */
  describe("Hook: Self Close", () => {
    it("should create an issue for non-void self-closing element", async (done) => {
      try {
        var opts = new Options();
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

  /**
  * Obsolete Hook
  */
  describe("Hook: Obsolete", () => {
    it("should create an issue for obsolete element", async (done) => {
      try {
        var opts = new Options();

        opts.obsolete.elements.push({ elmt: "undef", msg: "" });
        opts.obsolete.elements.push({ elmt: "foo", msg: "boo" });

        var task = new HtmlParseTask(opts);

        var file = new File({
          content: "<template><foo></foo></template>",
          path: "foo.html",
          kind: FileKind.Html
        });

        await task.process(file);

        const issues = file.issues;

        expect(issues).toBeDefined();
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("foo element is obsolete");
        expect(issues[0].detail).toBe("boo");
      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should create an issue for obsolete attribute", async (done) => {
      try {
        var opts = new Options();
        opts.obsolete.attributes.push({ attr: "pop", msg: "boo" });
        opts.obsolete.attributes.push({ attr: "undef", msg: "" });
        var task = new HtmlParseTask(opts);

        var file = new File({
          content: `<template><foo pop="value"></foo></template>`,
          path: "foo.html",
          kind: FileKind.Html
        });

        await task.process(file);

        const issues = file.issues;

        expect(issues).toBeDefined();
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("pop attribute is obsolete");
        expect(issues[0].detail).toBe("boo");
      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should create an issue for obsolete attribute on matching element", async (done) => {
      try {
        var opts = new Options();
        opts.obsolete.attributes.push({ attr: "undef", msg: "" });
        opts.obsolete.attributes.push({ attr: "pop", elmt: "foo", msg: "boo" });
        var task = new HtmlParseTask(opts);

        var file = new File({
          content: `<template><foo pop="value"></foo></template>`,
          path: "foo.html",
          kind: FileKind.Html
        });

        await task.process(file);

        const issues = file.issues;

        expect(issues).toBeDefined();
        expect(issues.length).toBe(1);
        expect(issues[0].message).toBe("pop attribute is obsolete");
        expect(issues[0].detail).toBe("boo");
      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should not create an issue for obsolete attribute on non-matching element", async (done) => {
      try {
        var opts = new Options();
        opts.obsolete.attributes.push({
          attr: "pop",
          elmt: "foo",
          msg: "boo"
        });
        var task = new HtmlParseTask(opts);

        var file = new File({
          content: `<template><moo pop="value"></moo></template>`,
          path: "foo.html",
          kind: FileKind.Html
        });

        await task.process(file);

        const issues = file.issues;

        expect(issues).toBeDefined();
        expect(issues.length).toBe(0);
      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
