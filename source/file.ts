import { Stream, Readable } from 'stream';
import { Issue } from "./issue";
import { ASTNode } from "./ast";
import { FileKind } from './file-kind';
import { FileLocation } from './file-location';
import { FileImport } from './file-import';
import { Resource } from './resource';
import * as ts from 'typescript';
import { Path } from './utils/safe-path';
export { FileImport } from './file-import';
export { FileKind } from './file-kind';
export { FileLocation } from './file-location';

export class File implements IFile {
  public content: string;
  public hash?: string;
  public kind: FileKind;
  public path?: string;
  public issues = new Array<Issue>();
  public imports: { [path: string]: FileImport } = {};

  constructor(opts: { content: string, kind: FileKind, path?: string, [i: string]: any }) {
    if (opts == null)
      throw Error("opts cannot be null");

    if (opts.content == null)
      throw Error("content cannot be null");
    if (opts.kind == null)
      throw Error("kind cannot be null");
    if (opts.path) {
      if (opts.path.trim() == "")
        throw Error("path cannot be empty string");
    }

    Object.assign(this, opts);

    if (this.path) {
      this.path = Path.normalize(this.path).replace(/\\/g, "/");
    }
  }

  isSourceFile(): this is ISourceFile {
    return this.kind == FileKind.Source;
  }

  isHtmlFile(): this is IHtmlFile {
    return this.kind == FileKind.Html;
  }
}

export interface IFile {
  content: string;
  kind: FileKind;
  path?: string;
  issues: Array<Issue>;
  imports: { [path: string]: FileImport };
}

export interface IHtmlFile extends IFile {
  ast: ASTNode;
  resources: string[];
}

export interface ISourceFile extends IFile {
  source: ts.SourceFile;
  resources: Resource[];
}
