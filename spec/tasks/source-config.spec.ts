import { Project } from '../../source/index';
import { Options } from '../../source/index';
import { File, FileLocation, FileKind, FileTask } from '../../source/index';
import { Issue, IssueSeverity } from '../../source/issue';
import { IssueSortTask } from '../../source/tasks/issue-sort';
import { ResourceKind } from '../../source/resource';
import { ResourceCollection } from '../../source/resource-collection';

import { SourceProcessTask } from '../../source/tasks/source-process';
import { SourceConfigTask } from '../../source/tasks/source-config';

import { Reflection } from '../../source/reflection/reflection';

import * as ts from 'typescript';

describe("Task: Source Config Analysis", () => {
  describe("Basic", () => {
    it("should resolve call to globalResources with array and register global-resources", async (done) => {
      try {
        let indexPath = "./index.ts";
        let indexFile = new File({
          kind: FileKind.Source,
          path: indexPath,
          content: `
          export function configure(config){
             config.globalResources(['./foo'])
          }`
        });

        let fooPath = './foo.ts';
        let fooFile = new File({
          kind: FileKind.Source,
          path: fooPath,
          content: `
          export class FooCustomElement{
          }`,
          resources: [{ name: "foo", kind: ResourceKind.CustomElement }]
        });

        let opts = new Options();
        let ref = new Reflection();
        let globals = new ResourceCollection();
        let setup = new SourceProcessTask(opts, ref);
        let task = new SourceConfigTask(opts, globals);

        await setup.process(indexFile, async (_) => undefined);
        await task.process(indexFile, async (_) => fooFile);

        expect(globals.length).toBe(1);
        expect(globals.getResourceByIndex(0)).toBeDefined();
        expect(globals.getResourceByIndex(0).name).toBe("foo");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
