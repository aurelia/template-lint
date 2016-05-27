"use strict";

import {SAXParser, TreeAdapter, ASTNode} from 'parse5';
import * as parse5 from 'parse5';
import {Readable} from 'stream';

/**
* Abstract Lint Rule 
*/
export abstract class Rule {
    public name: string;
    public description: string;
    public errors: string[];
    abstract init(parser: SAXParser)
}

/**
 * Rule to ensure non-void elements do not self-close
 */
export class SelfCloseRule extends Rule {
    public name: string;
    public description: string;
    public errors: string[];

    init(parser: SAXParser) {

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
    public name: string;
    public description: string;
    public errors: string[];

    init(parser: SAXParser) {
        var self = this;
        self.errors = [];
        
        var isRoot = true;
        var found = 0;
        
                
        parser.on('startTag', (name, attrs, selfClosing, location) => {            
            
            if (isRoot) 
            {
                isRoot = false;
                
                if (name != 'template')                {
                    let error = "root element is not template [line: " + location.line + "]";
                    self.errors.push(error);  
                    return;                    
                }             
            }
            
            if (name == 'template')            
            {                
                if(found > 0)
                { 
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
    public name: string;
    public description: string;
    public errors: string[];

    init(parser: SAXParser) {
        var self = this;
        self.errors = [];

        
        var capture = false;
        var stack = [];      
     
        parser.on('startTag', (name, attrs, selfClosing, location) => {            
            
            if(capture)
            {
                 let error = "tags within router-view are illegal [line: " + location.line + "]";
                 self.errors.push(error);
            }
            
            if(name == 'router-view')     
                capture = true;
        });
        
        parser.on('endTag', (name, location) => {           
            if(name == 'router-view')     
                capture = false;
        });
    }
}

/**
 *  Rule to ensure require element is well formed
 */
export class RequireRule extends Rule {
    public name: string;
    public description: string;
    public errors: string[];

    init(parser: SAXParser) {
        var self = this;
        self.errors = [];
      
        parser.on('startTag', (name, attrs, selfClosing, location) => {            
            
            if(name != 'require')
                return;
                
            let result = attrs.find(x=>(<any>x).name == 'from');   
            
            if(!result)
            {
                 let error = "require tag is missing from attribute [line: " + location.line + "]";
                 self.errors.push(error);
            }
        });
    }
}

export class Linter {

    private rules: Array<Rule>;

    constructor(rules?: Rule[]) {
        if (!rules)
            rules = [
                new SelfCloseRule(),
                new TemplateRule(),
                new RequireRule(),
                new RouterRule(),
            ];
        this.rules = rules;
    }
    
    lint(html: string): Promise<string[]> {
        var parser: SAXParser = new SAXParser({ locationInfo: true });

        var stream: Readable = new Readable();

        stream.push(html);
        stream.push(null);

        this.rules.forEach((rule) => {
            rule.init(parser)
        });

        var work = stream.pipe(parser);

        var completed = new Promise<void>(function (resolve, reject) {
            work.on("end", () => { resolve(); });
        });

        var ruleTasks = [];

        this.rules.forEach((rule) => {
            let task = completed.then(() => {
                return rule.errors
            });
            ruleTasks.push(task);
        });

        return Promise.all(ruleTasks).then(results => {

            var all = []

            results.forEach(parts => {
                all = all.concat(parts);
            });

            return all;
        });
    }
}