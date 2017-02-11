import { Linter, Config, Options } from '../source/index';
import { File, FileKind } from '../source/index';
import { Project } from '../source/project';
import { ProjectBuilder } from '../source/project-builder';
import { defaultResolveViewModel } from '../source/conventions';

describe("Conventions", () => {
  describe("Resolve ViewModel", () => {
    it("should resolve to exported class FooCustomElement", async (done) => {
      try {
        let config = new Config();
        let projectBuilder = new ProjectBuilder();
        let project = projectBuilder.build(config.options);

        let source = await project.process(new File({
          kind: FileKind.Source,
          path: "./foo.ts",
          content: `export class FooCustomElement{}`
        }));

        let markup = await project.process(new File({
          kind: FileKind.Html,
          path: "./foo.html",
          content: `<template><template>`
        }));

        // TODO: need to have fetch convert `foo` to `foo.ts`
        let viewModelResolve = await defaultResolveViewModel(markup, project.fetch);

        console.log(viewModelResolve);

      } catch (err) {
        fail(err);
      }
      finally {
        done();
      }
    });
  });
});
