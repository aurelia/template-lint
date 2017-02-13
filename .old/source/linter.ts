import { Options } from './options';
import { Config } from './config';
import { File, FileKind } from './file';
import { Fetch } from './fetch';
import { Issue } from './issue';
import { Project } from './project';
import { ProjectBuilder, IProjectBuilder } from './project-builder';
import { Path } from './utils/safe-path';
import * as glob from 'glob';
import * as fs from 'fs';

export class Linter {
  protected project: Project;

  constructor(
    protected config: Config = new Config,
    protected fetch: Fetch = createDefaultFetch(config),
    private projectBuilder: IProjectBuilder = new ProjectBuilder()
  ) {
    this.project = this.projectBuilder.build(config.options);
  }

  /** 
   * initialise the linter and process all initial files
   */
  async init(): Promise<void> {
    await this.processFiles(this.config.typings, this.fetch);
    await this.processFiles(this.config.source, this.fetch);
  }

  /**
   * lint html
   */
  async lint(markup: string, path?: string): Promise<Issue[]> {
    let file = new File({ content: markup, kind: FileKind.Html, path: path });
    let result = await this.project.process(file, this.fetch);

    return result.issues;
  }

  protected processFiles(pattern: string, fetch: Fetch): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      glob(pattern, {}, async (err, matches) => {
        try {
          for (var match of matches) {
            var file = await this.fetch!(match);
            if (file) {
              await this.project!.process(file, fetch);
            }
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  // change events... 
}
