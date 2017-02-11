import { Content } from '../content';
import { ContentContext } from '../context';
import { Options } from '../options';
import { Parser } from './parser/parser';
import { ParserState } from './parser/parser-state';
import { ParserHook } from './parser/parser-hook';

import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';
import { ObsoleteHook } from './parser/hooks/obsolete';

/**
 * Parse HTML Process
 */
export function htmlParse() {
  return async function process(ctx: ContentContext) {
    const opts = ctx.options;
    const hooks = [
      new ASTGenHook(opts),
      new SelfCloseHook(opts),
      new ObsoleteHook(opts)
    ];
    await Parser.process(ctx, hooks);
  };
}
