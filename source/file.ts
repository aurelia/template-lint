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
      opts.path = Path.normalize(opts.path);
    }
    
    if (typeof opts.content == "string") {

      var stream: Readable = new Readable();
      stream.push(opts.content);
      stream.push(null);

      opts.content = stream;
    }

    Object.assign(this, opts);
  }

}
