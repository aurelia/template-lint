
"use strict";

import {Rule, ParseState, RuleError} from 'template-lint';
import {SAXParser} from 'parse5';

/**
 *  Rule to ensure root element is the template element
 */
export class TemplateRule extends Rule {
    disable:boolean;
    first:boolean;
    count:number;

    init(parser: SAXParser, parseState: ParseState) {
        var self = this;
        self.disable = false;
        self.first = true;
        self.count = 0;

        parser.on('startTag', (name, attrs, selfClosing, location) => {

            // Ignore Full HTML Documents
            if (self.disable || name == 'html') {
                self.disable = true;
                return;
            }

            if (self.first) {

                if (name != 'template') {
                    let error = new RuleError("root element is not template", location.line, location.col);
                    self.reportError(error);
                    return;
                }
                
                self.count++;
                self.first = false;
                return;
            } 

            if(attrs.findIndex(x=>x.name == "replace-part") != -1){
                return;                
            }

            if (name == 'template') {
                if (self.count > 0) {
                    if (parseState.stack.length > 0) {
                        let error = new RuleError("nested template found", location.line, location.col);
                        self.reportError(error);
                    }
                    else {
                        let error = new RuleError("extraneous template found", location.line, location.col);
                        self.reportError(error);
                    }
                }
                self.count += 1;
            }
        }); 
    }
    
    finalise():RuleError[]
    {       
        this.disable = false;
        this.first = true;
        this.count = 0;
        
        return super.finalise();
    }
}

