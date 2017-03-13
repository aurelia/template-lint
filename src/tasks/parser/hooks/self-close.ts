import { Issue, IssueSeverity } from '../../../issue';
import { ParserHook } from '../parser-hook';

/**
 * Hook to ensure non-void elements do not self-close
 */
export class SelfCloseHook extends ParserHook {

  protected hook(): void {
    if (this.context.options["report-html-self-close"] === false) {
      return;
    }

    this.parser.on('startTag', (name, attrs, selfClosing, loc) => {

      let scope = this.parser.state.scope;

      if (scope === 'svg' || scope === 'math') {
        return;
      }
      if (selfClosing && this.parser.state.isVoid(name) === false) {
        if (loc === undefined) { throw new Error("loc is " + loc); }
        let issue: Issue = {
          message: "self-closing element",
          severity: IssueSeverity.Error,
          location: {
            line: loc.line,
            column: loc.col,
            start: loc.startOffset,
            end: loc.endOffset,
          },
        };
        this.reportIssue(issue);
      }
    });
  }
  finalise(): void {
    return undefined;
  }
}
