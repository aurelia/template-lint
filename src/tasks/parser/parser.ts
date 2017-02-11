import { SAXParser, StartTagLocationInfo } from 'parse5';
import * as parse5 from 'parse5';

import { ParserState } from './parser-state';
import { ParserHook } from './parser-hook';

import { ContentContext } from '../../context';
import { Content, ContentKind } from '../../content';
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

  public init(hooks: ParserHook[], context: ContentContext) {
    this.state.initPreHooks(this);

    hooks.forEach((hook) => {
      hook.init(this, context);
    });

    this.state.initPostHooks(this);
  }

  public finalise() {
    this.state.finalise();
  }

  public static async process(context: ContentContext, hooks: ParserHook[]): Promise<void> {

    if (!context)
      throw Error("file is null");

    var parserState = new ParserState();
    var parser = new Parser(parserState);

    hooks = hooks || [];
    parser.init(hooks, context);

    var stream: Readable = new Readable();

    var completed = new Promise<void>(function (resolve, reject) {
      parser.on("end", () => {
        parser.finalise();
        resolve();
      });
      parser.on("error", err => {
        reject(err);
      });
    });

    context.content.pipe(parser);

    await completed;

    for (var hook of hooks) {
      hook.finalise();
    }

    for (var issue of parserState.issues) {
      context.issues.push(issue);
    }
  }
}
