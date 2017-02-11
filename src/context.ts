import { Content } from './content';
import { Issue } from './issue';
import { Fetch } from './fetch';
import { Options } from './options';
import { Resource } from './resource';

/* processing context for a file or snippet */
export interface ContentContext {
  /* the file content and (optional) module id (path) */
  content: Content;
  /* reported issues */
  issues: Array<Issue>;
  /* options to use during processing of this context */
  options: Options;
  /* fetch a seperate file*/
  fetch: Fetch;   
  /*globally registed resources*/
  globals: Resource[];
}
