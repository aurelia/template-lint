import { Content } from './content';
import { ContentContext } from './context';
import { Options } from './options';
import { Issue, IssueSeverity } from './issue';
import { Config } from './config';
import { Fetch, FetchOptions } from './fetch';

export type Result = {
  content: Content,
  issues: Issue[]
}

export class Linter {
  private _cache = new Map<string, ContentContext>();
  private _cacheFetch: Fetch;
  private _processQueue: Content[] = [];
  private _globals = [];


  constructor(private _config: Config = new Config()) {
    this._cacheFetch = this.wrapFetch(_config.fetch);
  }

  async process(content: Content): Promise<Result> {
    let ctx = this.createContext(content, this._config.fetch);
    await this._config.processor.process(ctx, undefined);
    return ctx;
  }

  /**
   * wrap the config fetch 
   */
  private wrapFetch(fetch?: Fetch): Fetch {
    return async (path: string, opts?: FetchOptions) => {

      if (this._cache.has(path)) {
        return this._cache.get(path);
      }

      if (fetch != undefined) {
        const content = await fetch(path);

        if (content == undefined)
          return undefined;

        let ctx = this.createContext(content, fetch);

        if (!opts || opts.process) {
          await this._config.processor.process(ctx, undefined);
        }

        return ctx.content;
      }

      return undefined;
    };
  }

  private createContext(content: Content, fetch: Fetch): ContentContext {
    return {
      content: content,
      issues: [],
      options: this._config.options,
      fetch: fetch,
      globals: this._globals
    };
  }
}
