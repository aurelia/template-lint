import { Content } from '../content';
import { ContentContext } from '../context';
import { Options } from '../options';
import { Parser } from './parser/parser';
import { ParserHook } from './parser/parser-hook';


/**
 * Parse HTML Process
 */
export function htmlParse(...hooks: ParserHook[]) {
  return async function process(ctx: ContentContext) {
    await Parser.process(ctx, hooks);
  };
}
