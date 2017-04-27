import { Resolve } from './resolve';
import { Content, ContentKind } from './content';
import { Options } from './options';
import { Path, CaseConvert } from './utils';
import { Reflection } from './reflection';
import { ContentContext } from './context';
import { Rowan, IProcessor } from 'rowan';
import * as ts from 'typescript';

/* task middleware */

import { issueSort } from './tasks/issue-sort';
import { unhandledError} from './tasks/unhandled-error';
import { htmlParse } from './tasks/html-parse';
import { SourceProcessTask } from './tasks/source-process';

/* parser hooks */

import { ParserHook } from './tasks/parser/parser-hook';
import { ASTGenHook } from './tasks/parser/hooks/ast-generator';
import { SelfCloseHook } from './tasks/parser/hooks/self-close';
import { ObsoleteHook } from './tasks/parser/hooks/obsolete';

import { Handler } from 'rowan';

/** project and setup configuration */
export class Config {
  /* working directory */
  cwd = __dirname;

  /* basepath */
  basepath = "./";

  /* extension for source files */
  srcExt: "ts" | "js" = "ts";

  /** default Options */
  options = new Options();

  /** method used to resolve view -> viewModel*/
  resolveViewModel = defaultResolveViewModel();

  /* fetch a file from the file system*/
  fetch: Resolve = defaultFetch(this);

  /* typescript reflection host and helpers */
  reflection = new Reflection();

  /* html parser hooks */
  hooks = [new ASTGenHook(), new SelfCloseHook(), new ObsoleteHook()];

  /* content processor */
  processor = defaultProcessor(this.reflection, this.hooks);
}

function defaultProcessor(reflection: Reflection, hooks: ParserHook[]): IProcessor<ContentContext> {
  let html = new Rowan<ContentContext>();
  let source = new Rowan<ContentContext>();
  let app = new Rowan<ContentContext>();

  html.use((ctx) => Content.isHtmlContent(ctx.content));
  html.use(htmlParse(...hooks));

  source.use((ctx) => Content.isSourceContent(ctx.content));
  source.use(new SourceProcessTask(reflection));

  app.use(html);
  app.use(source);
  app.use(issueSort());
  app.use(unhandledError());

  return app;
}



function defaultResolveViewModel(): Handler<ContentContext> {
  return async function (ctx: ContentContext): Promise<{ file?: Content, decl?: ts.ClassDeclaration } | undefined> {
    const fetch = ctx.resolve;
    let view = ctx.content;

    if (view.kind !== ContentKind.Html) {
      return undefined;
    }

    if (view.path === undefined) {
      return undefined;
    }

    let baseName = Path.basename(view.path, Path.extname(view.path));
    let viewName = CaseConvert.camelToPascalCase(CaseConvert.kebabToCamelCase(baseName));

    let sourcePath = Path.join(Path.dirname(view.path), baseName);
    let sourceFile = await fetch(sourcePath);

    if (sourceFile === undefined || !Content.isSourceContent(sourceFile)) {
      return undefined;
    }

    let source = sourceFile.source;
    let exports = Reflection.getExportedClasses(source);

    if (exports === undefined || exports.length === 0) {
      return undefined;
    }

    let candidate: ts.ClassDeclaration | undefined = undefined;

    // If "some-thing.[ts|js]" has any class named SomeThingCustomElement, return it

    candidate = exports.find(x => x.getText().endsWith("CustomElement"));

    if (candidate !== undefined) {
      return { file: sourceFile, decl: candidate };
    }

    // If "some-thing.[ts|js]" has any class "SomeThing" + @customElement() decorator, return it

    candidate = exports.find(x => {
      let decos = Reflection.getClassCallDecorators(x);
      if (decos === undefined) {
        return false;
      }

      let decoCustom = decos.filter(y => y.call === "customElement");

      return decoCustom !== undefined;
    });

    if (candidate !== undefined) {
      return { file: sourceFile, decl: candidate };
    }

    // If "some-thing.[ts|js]" first export is class "SomeThing", return it

    if (exports[0].getText() === viewName) {
      candidate = exports[0];
    }

    if (candidate !== undefined) {
      return { file: sourceFile, decl: candidate };
    }

    // If "some-thing.[ts|js]" first export is class "Anything", return it (Router case only)

    candidate = exports[0];

    return { file: sourceFile, decl: candidate };
  };
}

import * as fs from 'fs';

function defaultFetch(config: Config): Resolve {
  let srcExt = config.srcExt;

  return async (uri, _) => {
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
          return undefined;
        }
      }
    } catch (_) {
      if (Path.extname(fullPath) !== "") {
        return undefined;
      }

      try {
        fullPath += srcExt;
        stats = fs.lstatSync(fullPath);
      }
      catch (err) {
        return undefined;
      }
    }

    let kind: ContentKind;

    if (fullPath.endsWith(".ts") || fullPath.endsWith(".js")) {
      kind = ContentKind.Source;
    } else if (fullPath.endsWith(".html")) {
      kind = ContentKind.Html;
    } else {
      kind = ContentKind.Unknown;
    }

    return Object.assign(fs.createReadStream(fullPath), {
      kind: kind, path: Path.relative(config.cwd, fullPath)
    });
  };
}
