import { Parser } from './parser';
import { Issue } from '../../issue';
import { File } from '../../file';

/**
* Parser Hook
*/
export abstract class ParserHook {
  protected parser: Parser;
  protected file: File;

  /**
  * Initialise and hook into the parser. 
  */
  public init(parser: Parser, file: File) {
    if (!parser) throw Error("parser is null");
    if (!file) throw Error("file is null");
    this.parser = parser;
    this.file = file;
    this.initHooks();
  }


  /**
  * Called when parsing is complete. 
  */
  protected abstract initHooks();

  /**
  * Called when parsing is complete. 
  */
  public abstract finalise();

  /**
  * Save an issue that will be added to the file . 
  */
  protected reportIssue(issue: Issue) {
    this.file.issues = this.file.issues || [];
    if (issue) {
      this.file.issues.push(issue);
    }
  }
}
