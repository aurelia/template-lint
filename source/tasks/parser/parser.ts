import { SAXParser, StartTagLocationInfo } from 'parse5';
import * as parse5 from 'parse5';

import { ParserState } from './parser-state';
import { ParserHook } from './parser-hook';

import { File, FileKind } from '../../file';
import { FileTask } from '../../file-task';
import { Issue } from '../../issue';
import { Readable, Stream } from 'stream';

export class Parser extends SAXParser {
  private constructor(public state: ParserState) {
    super({ locationInfo: true });
    this.setMaxListeners(100);
  }

  public isVoid(name: string): boolean {
    return this.state.isVoid(name);
  }

  public isScope(name: string): boolean {
    return this.state.isScope(name);
  }

  public init(hooks: ParserHook[], file: File) {
    this.state.initPreHooks(this);

    hooks.forEach((hook) => {
      hook.init(this, file);
    });

    this.state.initPostHooks(this);
  }

  public finalise() {
    this.state.finalise();
  }

  public static async process(file: File, hooks: ParserHook[]): Promise<void> {

    if (!file)
      throw Error("file is null");

    var parserState = new ParserState();
    var parser = new Parser(parserState);

    hooks = hooks || [];
    parser.init(hooks, file);

    file.content.pipe(parser);

    var completed = new Promise<void>(function (resolve, reject) {
      parser.on("end", () => {
        parser.finalise();
        resolve();
      });
    });

    await completed
      .then(() => {
        return Promise.all(hooks.map((hook) => {
          return hook.finalise();
        }));
      });

    if (parserState.issues) {
      file.issues = file.issues || [];
      for (var issue of parserState.issues) {
        file.issues.push(issue);
      }
    }
  }
}
