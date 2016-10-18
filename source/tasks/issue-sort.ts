import { FileTask } from '../file-task';
import { File } from '../file';
import { Options } from '../options';


/**
 *  Sort the issues based on location start
 */
export class IssueSortTask implements FileTask {
  async process(file: File): Promise<boolean> {

    file.issues = file.issues.sort((a, b) => {
      if (!a.location && !b.location)
        return 0;
      if (!a.location)
        return 1;
      if (!b.location)
        return -1;

      return b.location.start - a.location.start;
    });

    return false;
  }
}
