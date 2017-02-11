import { ContentContext } from '../context';
import { Content } from '../content';
import { Options } from '../options';


/**
 *  Sort the issues based on location start
 */
export function issueSort() {
  return async function (file: ContentContext) {
    file.issues = file.issues.sort((a, b) => {
      if (!a.location && !b.location)
        return 0;
      if (!a.location)
        return 1;
      if (!b.location)
        return -1;

      return b.location.start - a.location.start;
    });
  };
}
