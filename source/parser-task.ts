import { Parser } from './parser';
import { Issue } from './issue';
import { ASTNode } from './ast';

/**
* Abstract Lint Rule 
*/
export abstract class ParserTask {
  private issues: Issue[];

  constructor() {
    this.issues = [];
  }

  /**
  * Initialise the Rule and hook into the parser. 
  */
  public abstract init(parser: Parser, path?: string);


  /**
  * Called when parsing is complete. 
  * If you override finalise(), ensure you `return super.finalise()`)
  */
  public finalise(root?: ASTNode): Issue[] {
    let issues = this.issues;
    this.issues = [];
    return issues;
  }

  /**
  * Save an issue that will be returned from the linter
  */
  protected reportIssue(issue: Issue) {
    if (issue) {
      this.issues.push(issue);
    }
  }
}
