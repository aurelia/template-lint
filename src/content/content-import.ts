import { Content } from './content';
import { ContentLocation } from './content-location';

export interface ContentImport {
  /** the imported content */
  content: Content;

  /** location of the import statement */
  location: ContentLocation;
}
