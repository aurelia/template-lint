import { ContentContext } from '../context';
import { Handler } from 'rowan';

/**
 *  Sort the issues based on location start
 */
export function issueSort(): Handler<ContentContext> {
  return async function (file: ContentContext): Promise<void> {
    file.issues = file.issues.sort((a, b) => {
      if (!a.location && !b.location) {
        return 0;
      }
      if (!a.location) {
        return 1;
      }
      if (!b.location) {
        return -1;
      }

      return b.location.start - a.location.start;
    });
  };
}
