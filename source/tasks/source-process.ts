import { FileTask } from '../file-task';
import { File, FileKind, FileLocation } from '../file';
import { Fetch } from '../fetch';
import { Issue, IssueSeverity } from '../issue';
import { Options } from '../options';
import { ASTNode, ASTElementNode } from '../ast';
import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';
import { Reflection } from '../reflection/reflection';

/** Process a source file and add it to the Compiler Host */
export class SourceProcessTask implements FileTask {
  constructor(private opts: Options, private host: Reflection) {
  }

  async process(file: File, fetch: Fetch): Promise<boolean> {
    if (file.kind !== FileKind.Source)
      return false;

    if (file.path) {
      this.host.add(file.path, file.content);
    }//else todo... 

    return false;
  }
}
