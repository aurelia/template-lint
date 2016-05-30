
"use strict";

import {Rule, ParseState, RuleError} from 'template-lint';
import {SAXParser} from 'parse5';

/**
 *  Rule to ensure root element is the template element
 */
export class TemplateRule extends Rule {
    init(parser: SAXParser, parseState: ParseState) {
        var self = this;
        var disable = false;
        var first = true;
        var count = 0;

        parser.on('startTag', (name, attrs, selfClosing, location) => {

            // Ignore Full HTML Documents
            if (disable || name == 'html') {
                disable = true;
                return;
            }

            if (first) {

                if (name != 'template') {
                    let error = new RuleError("root element is not template", location.line, location.col);
                    self.reportError(error);
                    return;
                }
                
                count++;
                first = false;
                return;
            }           

            if (name == 'template') {
                if (count > 0) {
                    if (parseState.stack.length > 0) {
                        let error = new RuleError("nested template found", location.line, location.col);
                        self.reportError(error);
                    }
                    else {
                        let error = new RuleError("extraneous template found", location.line, location.col);
                        self.reportError(error);
                    }
                }
                count += 1;
            }
        });
    }
}

