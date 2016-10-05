"use strict";

import { ParserTask } from '../parser-task';
import { Parser } from '../parser';
import { Issue } from '../issue';

/**
 * Rule to ensure tags are properly closed. 
 */
export class StructureRule extends ParserTask {
  private parser: Parser;

  init(parser: Parser) {
    this.parser = parser;
  }
  finalise(): Issue[] {
    return this.parser.state.issues;
  }
}
