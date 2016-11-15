import { Options } from './options';
import { Config } from './config';
import { File, FileKind } from './file';
import { Fetch } from './fetch';
import { Project } from './project';
import { ProjectBuilder } from './project-builder';
import { Path } from './utils/safe-path';
import * as glob from 'glob';
import * as fs from 'fs';

export class Linter {
  private project: Project;
  private fetch: Fetch;

  /** 
   * initialise the linter and return all the processed files (initial)
   */
  async init(config: Config): Promise<void> {
    let builder = new ProjectBuilder();
    let project = builder.build(config.options);
    let fetch = this.createFetch(config);

    await this.processFiles(config.typings, fetch);
    await this.processFiles(config.source, fetch);
    await this.processFiles(config.markup, fetch);

    this.project = project;
    this.fetch = fetch;
  }

  private processFiles(pattern: string, fetch: Fetch): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      glob(pattern, {}, async (err, matches) => {
        try {
          for (var match of matches) {
            var file = await this.fetch(match);
            if (file) {
              await this.project.process(file, fetch);
            }
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  private createFetch(config: Config): Fetch {
    return (uri, _) => {
      return new Promise((resolve, reject) => {
        let fullPath = Path.join(config.basePath, uri);
        fs.readFile(uri, 'uft8', function (err, data) {
          if (err) reject(err);
          else {
            let kind: FileKind;

            if (uri.endsWith(".d.ts"))
              kind = FileKind.Typing;
            else if (uri.endsWith(".ts") || uri.endsWith(".js"))
              kind = FileKind.Source;
            else if (uri.endsWith(".html"))
              kind = FileKind.Html;
            else
              kind = FileKind.Unknown;

            resolve(new File({ content: data, kind: kind }));
          }
        });
      });
    };
  }

  // change events... 
}
