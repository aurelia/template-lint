
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

    constructor(public containers?:string[])
    {
        super();

        if(!this.containers)
            this.containers = ['table', 'select'];
    }

    init(parser: SAXParser, parseState: ParseState) {
      
        this.disable = false;
        this.first = true;
        this.count = 0;

        parser.on('startTag', (name, attrs, selfClosing, location) => {

            // Ignore Full HTML Documents
            if (this.disable || name == 'html') {
                this.disable = true;
                return;
            }

            if (this.first) {

                if (name != 'template') {
                    let error = new RuleError("root element is not template", location.line, location.col);
                    this.reportError(error);
                    return;
                }
                
                this.count++;
                this.first = false;
                return;
            }

            if (name == 'template') {
                if (this.count > 0) {
                    let stack = parseState.stack;
                    let stackCount = stack.length;
                    
                    if (stackCount > 0) {

                        this.containers.forEach(containerName => {
                            if(stack[stackCount-1].name == containerName)
                            {
                                let error = new RuleError(`template as child of <${containerName}> not allowed`, location.line, location.col);
                                this.reportError(error);
                            }                     
                        });
                    }
                    else {
                        let error = new RuleError("more than one template in file", location.line, location.col);
                        this.reportError(error);
                    }
                }
                this.count += 1;
            }
        }); 
    }  
}

