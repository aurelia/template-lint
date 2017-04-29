import { Handler, IProcessor, Rowan } from 'rowan';

import { Content, ContentContext } from './content';
import { Issue } from './issue';
import { Config } from './config';
import { Resolve, ResolveOptions } from './resolve';
import { Result } from './result';

/* task middleware */

import { issueSort } from './tasks/issue-sort';
import { unhandledError } from './tasks/unhandled-error';
import { htmlParse } from './tasks/html-parse';
import { SourceProcessTask } from './tasks/source-process';

export class Linter {
  private _processor: IProcessor<ContentContext>;

  constructor(private _config: Config = new Config()) {
    let html = new Rowan<ContentContext>();
    let source = new Rowan<ContentContext>();
    let app = new Rowan<ContentContext>();

    html.use((ctx) => Content.isHtmlContent(ctx.content));
    html.use(htmlParse(...this._config.hooks));

    source.use((ctx) => Content.isSourceContent(ctx.content));
    source.use(new SourceProcessTask(_config.reflection));

    app.use(html);
    app.use(source);
    app.use(issueSort());
    app.use(unhandledError());

    this._processor = app;
  }

  async process(content: Content): Promise<Result & ContentContext > {
    let ctx = this.createContext(content, this._config.fetch);
    await this._processor.process(ctx, undefined);
    return ctx;
  }

  /**
   * create a processing context for some content
   */
  private createContext(content: Content, fetch: Resolve): ContentContext {
    return {
      content: content,
      issues: [],
      options: this._config.options,
      resolve: fetch,
    };
  }
}
