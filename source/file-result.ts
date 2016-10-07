import { Issue } from "./issue";
import { ASTNode } from "./ast";
import { File } from './file';

export interface FileResult {
  issues: Issue[];
  file: File;
  root: ASTNode;
}
