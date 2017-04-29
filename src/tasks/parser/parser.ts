import { SAXParser } from 'parse5';
import { ParserState } from './parser-state';
import { ParserHook } from './parser-hook';
import { ContentContext } from '../../content';

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

  public init(hooks: ParserHook[], context: ContentContext): void {
    this.state.initPreHooks(this);

    hooks.forEach((hook) => {
      hook.init(this, context);
    });

    this.state.initPostHooks(this);
  }

  public finalise(): void {
    this.state.finalise();
  }

  public static async process(context: ContentContext, hooks: ParserHook[]): Promise<void> {

    if (!context) {
      throw Error("file is null");
    }

    const parserState = new ParserState();
    const parser = new Parser(parserState);

    hooks = hooks || [];
    parser.init(hooks, context);

    const completed = new Promise<void>((resolve, reject) => {
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

    for (const hook of hooks) {
      hook.finalise();
    }

    for (const issue of parserState.issues) {
      context.issues.push(issue);
    }
  }
}
