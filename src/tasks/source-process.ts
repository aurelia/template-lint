import { ContentContext } from '../context';
import { Content, ContentKind, ContentLocation } from '../content';
import { Fetch } from '../fetch';
import { Issue, IssueSeverity } from '../issue';
import { Options } from '../options';
import { ASTNode, ASTElementNode } from '../ast';
import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';
import { SourceReflection } from '../source-reflection';
import * as toString from 'stream-to-string';

/** Process a source file and add it to the Compiler Host */
export class SourceProcessTask {
  constructor(private host: SourceReflection) {
  }

  async process(ctx: ContentContext): Promise<boolean> {
    if (ctx.content.kind !== ContentKind.Source)
      return false;

    if (ctx.content.path) {      
      const contentStr = await toString(ctx.content);  
      const source = this.host.add(ctx.content.path, contentStr);
      ctx.content["source"] = source;
    }

    return false;
  }
}
