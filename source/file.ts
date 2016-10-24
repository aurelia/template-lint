import { Stream, Readable } from 'stream';
import { Issue } from "./issue";
import { ASTNode } from "./ast";
import { FileKind } from './file-kind';
import { FileLocation } from './file-location';
import { FileImport } from './file-import';

export { FileImport } from './file-import';
export { FileKind } from './file-kind';
export { FileLocation } from './file-location';

import _path = require('path');
import $path = _path.posix;

export class File {
  public content: string;
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
      this.path = $path.normalize(this.path).replace(/\\/g, "/");
    }
  }
}
