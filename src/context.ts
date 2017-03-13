import { Content } from './content';
import { Issue } from './issue';
import { Resolve } from './resolve';
import { Options } from './options';

/* processing context for a file or snippet */
export interface ContentContext {
  /* the file content and (optional) module id (path) */
  content: Content;
  /* reported issues */
  issues: Array<Issue>;
  /* options to use during processing */
  options: Options;
  /* fetch a seperate context*/
  resolve: Resolve;
}
