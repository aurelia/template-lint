import { Content } from './content';
import { ContentContext } from './context';
import { Issue } from './issue';
import { Config } from './config';
import { Resolve, ResolveOptions } from './resolve';

export type Result = {
  content: Content,
  issues: Issue[]
}

export class Linter {
  constructor(private _config: Config = new Config()) {
  }

  async process(content: Content): Promise<Result> {
    let ctx = this.createContext(content, this._config.fetch);
    await this._config.processor.process(ctx, undefined);
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
