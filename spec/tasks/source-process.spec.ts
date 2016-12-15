import { Project } from '../../source/index';
import { Options } from '../../source/index';
import { File, FileLocation, FileKind, FileTask } from '../../source/index';
import { Issue, IssueSeverity } from '../../source/issue';
import { IssueSortTask } from '../../source/tasks/issue-sort';

import { SourceProcessTask } from '../../source/tasks/source-process';
import { Reflection } from '../../source/reflection';

import * as ts from 'typescript';

describe("Task: Source Processing", () => {
  describe("When: file added to reflection", () => {
    it("Then: 'fileExists' returns true", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content:
          `export class Foo{
            field:number = 10;
          }`
        });

        let opts = new Options();
        let ref = new Reflection();
        let task = new SourceProcessTask(opts, ref);

        await task.process(file, async (_) => undefined);

        expect(ref.host.fileExists(filePath)).toBeTruthy();

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("Then: 'getFileNames' returns normalised file name", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content:
          `export class Foo{
            field:number = 10;
          }`
        });

        let opts = new Options();
        let ref = new Reflection();
        let task = new SourceProcessTask(opts, ref);

        await task.process(file, async (_) => undefined);

        let names = ref.getFileNames();

        expect(names.length).toBe(2);
        expect(names[0]).toBe("lib.d.ts");
        expect(names[1]).toBe("foo.ts");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("Then: 'getSourceFile returns valid source'", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content:
          `export class Foo{
            field:number = 10;
          }`
        });

        let opts = new Options();
        let ref = new Reflection();
        let task = new SourceProcessTask(opts, ref);

        await task.process(file, async (_) => undefined);

        var source = ref.host.getSourceFile(filePath, ts.ScriptTarget.Latest);

        expect(source).toBeDefined();

        expect(source.statements.length).toBe(1);

        expect(source.statements[0].kind).toBe(ts.SyntaxKind.ClassDeclaration);
        expect((source.statements[0] as ts.ClassDeclaration).name!.getText()).toBe("Foo");
      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("Then: 'getSourceFile returns valid source'", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content:
          `export class Foo{
            field:number = 10;
          }`
        });

        let opts = new Options();
        let ref = new Reflection();
        let task = new SourceProcessTask(opts, ref);

        await task.process(file, async (_) => undefined);

        expect(ref.host.getSourceFile(filePath, ts.ScriptTarget.Latest)).toBeDefined();

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
