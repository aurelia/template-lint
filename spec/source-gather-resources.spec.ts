import { Project } from '../source/index';
import { Options } from '../source/index';
import { File, FileLocation, FileKind, FileTask } from '../source/index';
import { IFile, ISourceFile } from '../source/index';
import { Issue, IssueSeverity } from '../source/issue';
import { IssueSortTask } from '../source/tasks/issue-sort';

import { SourceProcessTask } from '../source/tasks/source-process';
import { SourceGatherResourcesTask } from '../source/tasks/source-gather-resources';
import { Reflection } from '../source/reflection/reflection';
import { Resource, ResourceKind } from '../source/resource';

import * as ts from 'typescript';

describe("Task: Gather Aurelia Resources", () => {
  describe("Given: Class Export with customElement Decorator \n When: Processed" , () => {
    it("Then: should register 'foo' as a custom element", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content:       `
          import { customElement } from 'aurelia-framework';
          @customElement("foo")
          export class Foo{
            field:number = 10;
          }`
        });

        let opts = new Options();
        let ref = new Reflection();
        let setup = new SourceProcessTask(opts, ref);
        let task = new SourceGatherResourcesTask(opts);
                
        await setup.process(file, async (_) => undefined);
        await task.process(file, async (_) => undefined);

        let resources = (file as ISourceFile).resources;

        expect(resources.length).toBe(1);
        expect(resources[0].kind).toBe(ResourceKind.Element);
        expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
        

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
