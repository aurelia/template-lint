import { ContentContext } from '../context';
import { Content } from '../content';
import { Options } from '../options';
import { IssueSeverity } from '../issue';


/**
 *  Report unhandled errors
 */
export function unhandledError() {
  return async function (ctx: ContentContext, err: any) {
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
