"use strict";

import {SAXParser, StartTagLocationInfo} from 'parse5';
import * as parse5 from 'parse5';
import {Readable} from 'stream';

/**
* Abstract Lint Rule 
*/
export abstract class Rule {
    public name: string;
    public description: string;
    public errors: string[];
    abstract init(parser: SAXParser, parseState:ParseState)
    finalise() { }
}

/**
 * Rule to ensure non-void elements do not self-close
 */
export class SelfCloseRule extends Rule {
    init(parser: SAXParser, parseState:ParseState) {

        const voidTags = [
            'area', 'base', 'br', 'col', 'embed', 'hr',
            'img', 'input', 'keygen', 'link', 'meta',
            'param', 'source', 'track', 'wbr'];

        var self = this;
        self.errors = [];
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            if (selfClosing) {
                if (voidTags.indexOf(name) < 0) {
                    let error = "self-closing element [line: " + location.line + "]";
                    self.errors.push(error);
                }
            }
        });
    }
}

/**
 *  Rule to ensure root element is the template element
 */
export class TemplateRule extends Rule {
    init(parser: SAXParser, parseState:ParseState) {
        var self = this;
        self.errors = [];

        var isRoot = true;
        var found = 0;

        parser.on('startTag', (name, attrs, selfClosing, location) => {

            if (isRoot) {
                isRoot = false;

                if (name != 'template') {
                    let error = "root element is not template [line: " + location.line + "]";
                    self.errors.push(error);
                    return;
                }
            }

            if (name == 'template') {
                if (found > 0) {
                    let error = "another template element found [line: " + location.line + "]";
                    self.errors.push(error);
                }

                found += 1;
            }
        });
    }
}

/**
 *  Rule to ensure root element is the template element
 */
export class RouterRule extends Rule {
    init(parser: SAXParser, parseState:ParseState) {
        var self = this;
        self.errors = [];

        var capture = false;
        var stack = [];

        parser.on('startTag', (name, attrs, selfClosing, location) => {

            if (capture) {
                let error = "tags within router-view are illegal [line: " + location.line + "]";
                self.errors.push(error);
            }

            if (name == 'router-view')
                capture = true;
        });

        parser.on('endTag', (name, location) => {
            if (name == 'router-view')
                capture = false;
        });
    }
}

/**
 *  Rule to ensure require element is well formed
 */
export class RequireRule extends Rule {
    init(parser: SAXParser, parseState:ParseState) {
        var self = this;
        self.errors = [];

        parser.on('startTag', (name, attrs, selfClosing, location) => {

            if (name != 'require')
                return;

            let result = attrs.find(x => (<any>x).name == 'from');

            if (!result) {
                let error = "require tag is missing from attribute [line: " + location.line + "]";
                self.errors.push(error);
            }
        });
    }
}

export class WellFormedRule extends Rule {
    private parseState:ParseState;

    init(parser: SAXParser, parseState:ParseState) {  
        this.parseState = parseState;    
        this.errors = [];        
    }
    
    finalise(){
        this.errors = this.parseState.errors;               
    }
}

export class ParseNode {    
    constructor(public scope: string, public name: string, public location:StartTagLocationInfo)
    {        
    }      
}


/**
 *  Helper to maintain the current state of traversal.  
 */
export class ParseState {
    public stack: ParseNode[];
    public errors: string[];
    public scopes: string[];
    
    constructor(scopes?: string[]) {
        if (scopes == null)
            scopes = ['html', 'body', 'template', 'svg'];

        this.scopes = scopes;
    }

    init(parser: SAXParser) {
        this.stack = [];
        this.errors = [];

        var self = this;
        var stack = this.stack;                        

        parser.on("startTag", (name, attrs, selfClosing, location) => {            
            if (!selfClosing && !self.isVoid(name)) {
                let scope = ""

                if (stack.length > 0)
                    scope = stack[stack.length-1].scope;
                    
                if (self.isScope(name))
                    scope = name;
                    
                stack.push(new ParseNode(scope, name, location));
            }
        });
        
        parser.on("endTag", (name, location) => {
                        
            if(stack.length <= 0 || stack[stack.length-1].name != name)
            {
                let error = "mismatched close tag found [line: " + location.line + "]";
                self.errors.push(error);               
            }
            else{
                stack.pop();                
            }           
        });
    }

    finalise() {
        let stack = this.stack;
        let errors = this.errors;
        if(stack.length > 0)
        {
            let element = stack[stack.length-1]
            let error = "suspected unclosed element detected [line: " + element.location.line + "]";
            errors.push(error);                  
        }
    }

    private isVoid(name: string): boolean {
        const voidTags = [
            'area', 'base', 'br', 'col', 'embed', 'hr',
            'img', 'input', 'keygen', 'link', 'meta',
            'param', 'source', 'track', 'wbr'];

        return voidTags.indexOf(name) >= 0;
    }

    private isScope(name: string): boolean {
        return this.scopes.indexOf(name) >= 0;
    }
}

export class Linter {

    private rules: Array<Rule>;

    constructor(rules?: Rule[]) {
        if (!rules)
            rules = [
                new WellFormedRule(),
                new SelfCloseRule(),
                new TemplateRule(),
                new RequireRule(),
                new RouterRule(),
            ];
        this.rules = rules;
    }

    lint(html: string): Promise<string[]> {
        var parser: SAXParser = new SAXParser({ locationInfo: true });
        var parseState: ParseState = new ParseState();
        var stream: Readable = new Readable();
        
        // must be done before initialising rules
        parseState.init(parser); 

        stream.push(html);
        stream.push(null);

        var rules = this.rules;

        rules.forEach((rule) => {
            rule.init(parser, parseState);
        });

        var work = stream.pipe(parser);

        var completed = new Promise<void>(function (resolve, reject) {
            work.on("end", () => { 
                parseState.finalise();
                resolve(); 
            });
        });

        var ruleTasks = [];

        rules.forEach((rule) => {
            let task = completed.then(() => {      
                rule.finalise();
                return rule.errors
            });
            ruleTasks.push(task);
        });

        return Promise.all(ruleTasks).then(results => {

            var all = [];

            results.forEach(parts => {
                all = all.concat(parts);
            });

            return all;
        });
    }
}