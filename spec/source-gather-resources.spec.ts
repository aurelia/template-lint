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
  describe("Decorators", () => {
    it("should register 'foo' as a custom element when 'customElement' decorator found", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content: `
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
        expect(resources[0].kind).toBe(ResourceKind.CustomElement);
        expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
        expect(resources[0].name).toBe("foo");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });


    it("should register 'foo' as a custom attribute when 'customAttribute' decorator found", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content: `
          import { customAttribute } from 'aurelia-framework';
          @customAttribute("foo")
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
        expect(resources[0].kind).toBe(ResourceKind.CustomAttribute);
        expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
        expect(resources[0].name).toBe("foo");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should register 'foo' as a value converter when 'valueConverter' decorator found", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content: `
          import { valueConverter } from 'aurelia-framework';
          @valueConverter("foo")
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
        expect(resources[0].kind).toBe(ResourceKind.ValueConverter);
        expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
        expect(resources[0].name).toBe("foo");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should register 'foo' as a binding behaviour when 'bindingBehaviour' decorator found", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content: `
          import { bindingBehaviour } from 'aurelia-framework';
          @bindingBehaviour("foo")
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
        expect(resources[0].kind).toBe(ResourceKind.BindingBehaviour);
        expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
        expect(resources[0].name).toBe("foo");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });

  describe("Name Convention", () => {
    it("should register 'foo-bar' as a custom element when class name is 'FooBarCustomElement'", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content: `
          export class FooBarCustomElement{
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
        expect(resources[0].kind).toBe(ResourceKind.CustomElement);
        expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
        expect(resources[0].name).toBe("foo-bar");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });


    it("should register 'foo-bar' as a custom attribute when class name is 'FooBarCustomAttribute'", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content: `
          export class FooBarCustomAttribute{
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
        expect(resources[0].kind).toBe(ResourceKind.CustomAttribute);
        expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
        expect(resources[0].name).toBe("foo-bar");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should register 'foo-bar' as a value converter when class name is 'FooBarValueConverter'", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content: `
          export class FooBarValueConverter{
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
        expect(resources[0].kind).toBe(ResourceKind.ValueConverter);
        expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
        expect(resources[0].name).toBe("foo-bar");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });

    it("should register 'foo-bar' as a binding behaviour when class name is 'FooBarBindingBehaviour'", async (done) => {
      try {
        let filePath = './foo.ts';
        let file = new File({
          kind: FileKind.Source,
          path: filePath,
          content: `
          export class FooBarBindingBehaviour{
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
        expect(resources[0].kind).toBe(ResourceKind.BindingBehaviour);
        expect(resources[0].decl.kind).toBe(ts.SyntaxKind.ClassDeclaration);
        expect(resources[0].name).toBe("foo-bar");

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
