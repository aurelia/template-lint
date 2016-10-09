"use strict";

import { Issue, IssueSeverity} from '../../../issue';
import { Options } from '../../../options';
import { File } from '../../../file';
import { ParserHook } from '../parser-hook';
import { Parser } from '../parser';

/**
 * Hook to ensure non-void elements do not self-close
 */
export class SelfCloseHook extends ParserHook {
  constructor(private opts: Options)
  {
    super();    
  }

  initHooks() {
    this.parser.on('startTag', (name, attrs, selfClosing, loc) => {

      let scope = this.parser.state.scope;

      if (scope == 'svg' || scope == 'math') {
        return;
      }

      if (selfClosing && this.parser.state.isVoid(name) == false) {      
        let issue = <Issue>{
          message: "self-closing element",
          severity: IssueSeverity.Error,
          line: loc.line,
          column: loc.col,
          start: loc.startOffset,
          end: loc.endOffset
        };
        this.reportIssue(issue);
      }
    });
  }
  finalise(){}
}
