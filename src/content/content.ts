import { ContentKind } from './content-kind';
import { ContentLocation } from './content-location';
import { ContentImport } from './content-import';
import { Resource } from '../resource';
import { Readable } from 'stream';
import { Issue } from '../issue';
import { Path } from '../utils';

export type Content = NodeJS.ReadableStream & {
  kind: ContentKind;
  path?: string;
  imports?: ContentImport[];
}

export namespace Content {
  export function fromString(snippet: string, kind: ContentKind): Content
  export function fromString(file: string, path: string): Content
  export function fromString(data: string, opt: ContentKind | string): Content {
    const stream = (Object.assign(new Readable(), { kind: ContentKind.Unknown }));

    stream.push(data);
    stream.push(null);

    const content: Content = stream;

    if (typeof (opt) == "string") {
      const path = Path.normalize(opt).replace(/\\/g, "/");

      if (path.endsWith("html")) {
        content.kind = ContentKind.Html;
      }
      else if (path.endsWith("js") || path.endsWith("ts")) {
        content.kind = ContentKind.Source;
      }

      content.path = path;

    } else {
      content.kind = opt;
    }

    return content;
  }

  export function isSourceContent(file: Content): file is SourceFile {
    return file.kind === ContentKind.Source;
  }
  export function isHtmlContent(file: Content): file is HtmlFile {
    return file.kind === ContentKind.Html;
  }
}

import { ASTNode } from '../ast';

export type HtmlFile = Content & {
  ast: ASTNode;
  resources: string[];
}

import * as ts from 'typescript';

export type SourceFile = Content & {
  source: ts.SourceFile;
  resources: Resource[];
}
