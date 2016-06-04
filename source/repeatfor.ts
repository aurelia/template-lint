"use strict";

import {Rule, ParseState, RuleError} from 'template-lint';
import {SAXParser} from 'parse5';

/**
 * Rule to ensure tags are properly closed. 
 */
export class RepeatForRule extends Rule {

    private 

    init(parser: SAXParser, parseState: ParseState) {
        super.init(parser, parseState);
        
        var syntax:RegExp = /(.+)( +of +)(.+)/

        parser.on("startTag", (tag, attrs, selfClosing, loc) => {

            var self = this;
            
            attrs.forEach(attr => {
                if (attr.name == "repeat") {
                    let error = new RuleError("did you miss `.for` on repeat?", loc.line, loc.col);
                    self.reportError(error);
                    return;
                }
                if (attr.name == "repeat.for") {
                    var script = attr.value.trim();
                              
                    var matches = script.match(syntax);
                    
                    var error = null;
                    
                    if(matches == null || matches.length == 0){
                        let error = new RuleError("repeat syntax should be of form `* of *`", loc.line, loc.col);
                        self.reportError(error);
                    }                       
                }
            });
        });
    }
}