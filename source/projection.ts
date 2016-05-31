
"use strict";

import {Rule, ParseState, RuleError} from 'template-lint';
import {SAXParser} from 'parse5';

/**
 *  Rule to ensure root element is the template element
 */
export class ProjectionRule extends Rule {
    private projTags: string[];

    constructor(projTags?: string[]) {
        super();

        if (!projTags)
            projTags = ['slot', 'router-view', 'content'];

        this.projTags = projTags;
    }

    init(parser: SAXParser, parseState: ParseState) {
        var self = this;
        var stack = parseState.stack;
        
        let contentCheck = (name, attrs, selfClosing, location, errorStr) => {               
            if (stack.length > 0) {
                let parent = stack[stack.length - 1];

                self.projTags.forEach(tag => {
                    if (parent.name === tag) {
                        let error = new RuleError("found content within projection target (" + tag + ")", parent.location.line, parent.location.col);
                         self.reportError(error);
                         return;
                    }
                });
            }              
        };
        
        parser.on('startTag', contentCheck);
        parser.on("text", contentCheck);
    }
}



