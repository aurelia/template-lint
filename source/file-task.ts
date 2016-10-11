import { File } from './file';
import { Fetch } from './fetch';

export interface FileTask {
  /**
   * process and argment the file
   * @returns whether the process finalised the file
   */
  process(file: File, fetch: Fetch): Promise<boolean>;
}
