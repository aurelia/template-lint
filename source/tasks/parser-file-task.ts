import { FileTask } from '../file-task';
import { File } from '../file';
import { Options } from '../options';
import { Parser } from './parser/parser';
import { ParserState } from './parser/parser-state';
import { ParserHook } from './parser/parser-hook';
import { ASTGenerator } from './parser/hooks/ast-generator';

export class ParserFileTask implements FileTask {
  constructor(private opts: Options) {
  }

  async process(file: File): Promise<boolean> {

    var parserState = new ParserState();
    var parser = new Parser(parserState);
    var hooks = [new ASTGenerator(this.opts)];

    await parser.process(file, hooks);

    return false;
  }
}
