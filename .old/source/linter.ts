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

function createDefaultFetch(config: Config): Fetch {
  let srcExt = Path.extname(config.source);

  return (uri, _) => {
    return new Promise<File | undefined>((resolve, reject) => {
      // strip loaders from uri

      let uriLoaders = uri.match(config.loaderPattern);
      uri = uri.replace(config.loaderPattern, "");

      let fullPath = Path.join(config.cwd, config.basepath, uri);
      let stats: fs.Stats | undefined;

      try {
        stats = fs.lstatSync(fullPath);

        if (stats.isDirectory()) {
          fullPath = Path.join(fullPath, `index.${srcExt}`);
          try {
            stats = fs.lstatSync(fullPath);
          }
          catch (err) {
            resolve(undefined);
            return;
          }
        }
      } catch (_) {
        if (Path.extname(fullPath) != "") {
          resolve(undefined);
          return;
        }

        try {
          fullPath += srcExt;
          stats = fs.lstatSync(fullPath);
        }
        catch (err) {
          resolve(undefined);
          return;
        }
      }

      fs.readFile(fullPath, 'utf8', async (err, data) => {
        if (err) {
          resolve(undefined);
          return;
        }

        let kind: FileKind;

        if (fullPath.endsWith(".d.ts"))
          kind = FileKind.Typing;
        else if (fullPath.endsWith(".ts") || fullPath.endsWith(".js"))
          kind = FileKind.Source;
        else if (fullPath.endsWith(".html"))
          kind = FileKind.Html;
        else
          kind = FileKind.Unknown;

        let file = new File({ content: data, path: fullPath, kind: kind });

        if (!uriLoaders) {
          resolve(file);
          return;
        }

        for (var uriLoader of uriLoaders) {
          let loader = config.loaders.get(uriLoader);

          if (loader) {
            file = await loader(file);
            if (!file) {
              resolve(undefined);
              return;
            }
          }
        }
        resolve(file);
        return;
      });
    });
  };
}

