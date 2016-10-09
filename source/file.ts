import { Issue } from "./issue";
import { ASTNode } from "./ast";
import { File } from './file';
import { FileKind } from './file-kind';
export { FileKind } from './file-kind';

export interface File {
  content: string;
  kind: FileKind;

  path?: string;

  ext?: string;
  issues?: Issue[];
  imports?: string[];
}
