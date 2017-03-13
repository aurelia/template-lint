import { ContentContext } from '../context';
import { Parser } from './parser/parser';
import { ParserHook } from './parser/parser-hook';
import { Handler } from 'rowan';

/**
 * Parse-HTML Process
 */
export function htmlParse(...hooks: ParserHook[]): Handler<ContentContext> {
  return function (ctx: ContentContext): Promise<void> {
    return Parser.process(ctx, hooks);
  };
}
