import { FileTask } from '../file-task';
import { File } from '../file';
import { Options } from '../options';
import { Parser } from './parser/parser';
import { ParserState } from './parser/parser-state';
import { ParserHook } from './parser/parser-hook';

import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';

/**
 * Parse HTML  
 */
export class HtmlParseTask implements FileTask {
  constructor(private opts: Options) { }

  async process(file: File): Promise<boolean> {

    var hooks = [
      new ASTGenHook(this.opts),
      new SelfCloseHook(this.opts)
    ];

    await Parser.process(file, hooks);

    return false;
  }
}
