import { Parser } from './parser';
import { Issue } from '../../issue';
import { ContentContext } from '../../context';

/**
* Parser Hook
*/
export abstract class ParserHook {
  protected parser: Parser;
  protected context: ContentContext;

  /**
  * Initialise and hook into the parser. 
  */
  public init(parser: Parser, context: ContentContext) {
    if (!parser) throw Error("parser is null");
    if (!context) throw Error("context is null");
    this.parser = parser;
    this.context = context;
    this.hook();
  }


  /**
  * hook into the parser events
  */
  protected abstract hook();

  /**
  * Called when parsing is complete. 
  */
  public abstract finalise();

  /**
  * Save an issue that will be added to the file . 
  */
  protected reportIssue(issue: Issue) {
    this.context.issues = this.context.issues || [];
    if (issue) {
      this.context.issues.push(issue);
    }
  }
}
