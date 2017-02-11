import { File } from './file';
import { FileLocation } from './file-location';
export interface FileImport {
  /** the imported file */
  file: File;
  /** file location of the import statement */
  location: FileLocation;
}
