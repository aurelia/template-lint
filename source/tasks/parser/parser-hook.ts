import { Parser } from './parser';
import { Issue } from '../../issue';
import { File } from '../../file';

/**
* Parser Hook
*/
export abstract class ParserHook {
  protected file: File;

  /**
  * Initialise and hook into the parser. 
  */
  public init(parser: Parser, file: File) {
    if (!parser) throw Error("parser is null");
    if (!file) throw Error("file is null");
    this.file = file;
  }

  /**
  * Called when parsing is complete. 
  */
  public finalise() { }

  /**
  * Save an issue that will be added to the file . 
  */
  protected reportIssue(issue: Issue) {
    if (issue) {
      this.file.issues.push(issue);
    }
  }
}
