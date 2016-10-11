import { Stream, Readable } from 'stream';
import { Issue } from "./issue";
import { ASTNode } from "./ast";
import { FileKind } from './file-kind';
export { FileKind } from './file-kind';
import * as Path from 'path';


export class File {
  public content: Stream;
  public kind: FileKind;
  public path?: string;
  public issues = new Array<Issue>();
  public imports: { [key: string]: File } = {};

  constructor(opts: { content: Stream | string, kind: FileKind, path?: string, [i: string]: any }) {
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

    if (typeof this.content == "string") {

      var stream: Readable = new Readable();
      stream.push(this.content);
      stream.push(null);

      this.content = stream;
    }
    if (this.path) {
      this.path = Path.normalize(this.path);
    }
  }
}
