import { Project } from '../source/index';
import { Options } from '../source/index';
import { File, FileLocation, FileKind, FileTask } from '../source/index';
import { Issue, IssueSeverity } from '../source/issue';
import { IssueSortTask } from '../source/tasks/issue-sort';

import { SourceProcessTask } from '../source/tasks/source-process';
import { Reflection } from '../source/reflection/reflection';

import * as ts from 'typescript';

describe("Task: Source Processing", () => {
  describe("Compiler Host", () => {
    it("should add file and fileExists returns true", async (done) => {
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
    
    it("should add file and getSourceFile returns valid source", async (done) => {
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
