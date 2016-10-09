import { File } from './file';

export interface FileTask {
  /**
   * process and argment the file
   * @returns whether the process finalised the file
   */
  process(file: File): Promise<boolean>;
}
