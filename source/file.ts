import { Issue } from "./issue";
import { ASTNode } from "./ast";
import { FileKind } from './file-kind';
export { FileKind } from './file-kind';

export class File {
  public content: string;
  public kind: FileKind;
  public path?: string;
  public issues = new Array<Issue>();
  public imports?: string[];

  constructor(opts: { content: string, kind: FileKind, path?: string, issues?: Array<Issue>, imports?: string[] }) {
    if (opts == null)
      throw Error("opts cannot be null");
    if (opts.content == null)
      throw Error("content cannot be null");
    if (opts.kind == null)
      throw Error("kind cannot be null");
    if (opts.path && opts.path.trim() == "")
      throw Error("path cannot be empty string");
    if (opts.issues === null)
      throw Error("issues cannot be null");
    if (opts.imports === null)
      throw Error("issues cannot be null");

    Object.assign(this, opts);
  }
}
