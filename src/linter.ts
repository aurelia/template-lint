import { Content } from './content';
import { ContentContext } from './context';
import { Options } from './options';
import { IssueSeverity } from './issue';
import { Rowan, Handler, IProcessor } from 'rowan';
import { Reflection } from './reflection';

export type LintHandler = Handler<ContentContext>;

export class Linter {
  private _processQueue: Content[] = [];

  constructor(
    private _options = new Options(),
    private _reflection = new Reflection(),
    private _processor = defaultProcessor(_reflection)) {
  }
  async process(...content: Content[]) {
    this._processQueue.push(...content);
  }
}

import { issueSort } from './tasks/issue-sort';
import { unhandledError } from './tasks/unhandled-error';
import { htmlParse } from './tasks/html-parse';
import { SourceProcessTask } from './tasks/source-process';

import { ASTGenHook } from './tasks/parser/hooks/ast-generator';
import { SelfCloseHook } from './tasks/parser/hooks/self-close';
import { ObsoleteHook } from './tasks/parser/hooks/obsolete';

function defaultProcessor(reflection: Reflection): IProcessor<ContentContext> {
  let html = new Rowan<ContentContext>();
  let source = new Rowan<ContentContext>();
  let app = new Rowan<ContentContext>();

  html.use((ctx) => Content.isHtmlContent(ctx.content));
  html.use((ctx) => htmlParse(
    new ASTGenHook(),
    new SelfCloseHook(),
    new ObsoleteHook()));

  source.use((ctx) => Content.isSourceContent(ctx.content));
  source.use(new SourceProcessTask(reflection));

  app.use(html);
  app.use(source);
  app.use(issueSort());
  app.use(unhandledError());

  return app;
}
