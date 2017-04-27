import { ContentContext } from '../context';
import { ContentKind } from '../content';
import { Reflection } from '../reflection';
import * as toString from 'stream-to-string';

/** Process a source file and add it to the Compiler Host */
export class SourceProcessTask {
  constructor(private host: Reflection) {
  }

  async process(ctx: ContentContext): Promise<boolean> {
    if (ctx.content.kind !== ContentKind.Source) {
      return false;
    }

    if (ctx.content.path) {
      const contentStr = await toString(ctx.content);
      const source = this.host.add(ctx.content.path, contentStr);
      ctx.content["source"] = source;
    }

    return false;
  }
}
