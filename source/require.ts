
"use strict";

import {Rule, ParseState, RuleError} from 'template-lint';
import {SAXParser} from 'parse5';

/**
 *  Rule to ensure require element is well formed
 */
export class RequireRule extends Rule {
    init(parser: SAXParser, parseState: ParseState) {
        var self = this;

        parser.on('startTag', (name, attrs, selfClosing, location) => {

            if (name != 'require')
                return;

            let result = attrs.find(x => (<any>x).name == 'from');

            if (!result) {
                let error = new RuleError("require tag is missing a 'from' attribute", location.line, location.col);
                self.reportError(error);
            }
        });
    }
}
