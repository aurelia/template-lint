import { Rowan, IProcessor } from 'rowan';
import * as ts from 'typescript';


import { Resolve } from './resolve';
import { Content, ContentContext, ContentKind } from './content';
import { Options } from './options';
import { Path, CaseConvert } from './utils';
import { Reflection } from './reflection';
import { Aurelia } from './aurelia';

/* parser hooks */

import { ParserHook } from './tasks/parser/parser-hook';
import { ASTGenHook } from './tasks/parser/hooks/ast-generator';
import { SelfCloseHook } from './tasks/parser/hooks/self-close';
import { ObsoleteHook } from './tasks/parser/hooks/obsolete';

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

  /* fetch a file from the file system*/
  fetch: Resolve = defaultFetch(this);

  /* typescript reflection host and helpers */
  reflection = new Reflection();

  /** aurelia reflection */
  aurelia = new Aurelia();

  /* html parser hooks */
  hooks = [new ASTGenHook(), new SelfCloseHook(), new ObsoleteHook()];

  constructor(opts?: Partial<Config>) {
    Object.assign(this, opts);
  }
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
