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

    abstract init(parse: SAXParser, root: ASTNode);

    abstract lint(completed: Promise<void>): Promise<void>;
}

/**
 * Lint Rule to ensure non-void elements do not self-close
 */
export class SelfCloseRule extends Rule {
    private parser: SAXParser;

    public result: boolean;

    init(parser: SAXParser, root: ASTNode) {
        this.parser = parser;

        this.result = true;

        var self = this;

        parser.on('startTag', (name, attrs, selfClosing, location) => {
            self.result = self.result && (!selfClosing);
        });
    }

    lint(completed: Promise<void>): Promise<void> {
        var self = this;
        return completed
            .then(() => {
                if (self.result == false)
                    throw "failed";
            });
    }
}

export class Linter {

    private rules: Array<Rule>;

    constructor() {
        this.rules = [new SelfCloseRule()];
    }

    lint(html: string): Promise<boolean> {
        var parser: SAXParser = new SAXParser({ locationInfo: true });
        var stream: Readable = new Readable();

        stream.push(html);
        stream.push(null);

        var root = parse5.parseFragment(html, { locationInfo: true });

        this.rules.forEach((rule) => {
            rule.init(parser, root)
        });

        var work = stream.pipe(parser);

        var completed = new Promise<void>(function (resolve, reject) {
            work.on("end", () => { resolve(); });
        });

        var ruleTasks = [];

        this.rules.forEach((rule) => {
            var task = rule
                .lint(completed)
                .then(() => true);
            ruleTasks.push(task);
        });
        
        return Promise.all(ruleTasks).then(()=>true).catch(()=>false);       
    }
}

