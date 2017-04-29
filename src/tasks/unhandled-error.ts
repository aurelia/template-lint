import { ContentContext } from '../content';
import { IssueSeverity } from '../issue';
import { ErrorHandler } from 'rowan';

/**
 *  Report unhandled errors
 */
export function unhandledError(): ErrorHandler<ContentContext> {
  return async function (ctx: ContentContext, err: any): Promise<boolean | undefined> {
    if (ctx.options.debug) {
      ctx.issues.push({
        message: "unhandled exception during processing",
        detail: err,
        severity: IssueSeverity.Fatal
      });
    }
    return true;
  };
}
