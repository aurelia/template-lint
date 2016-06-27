import {TemplatingBindingLanguage, InterpolationBindingExpression} from 'aurelia-templating-binding';
import {AccessMember, AccessScope, AccessKeyed, NameExpression, ValueConverter} from 'aurelia-binding';
import {Container} from 'aurelia-dependency-injection';
import {Rule, Parser, ParserState, Issue, IssueSeverity} from 'template-lint';
import ts = require('typescript');

import {
    ViewResources,
    BindingLanguage,
    /*BehaviorInstruction,*/
    HtmlBehaviorResource,
    ViewFactory}
from 'aurelia-templating';

export class ASTBuilder extends Rule {
    protected root: ASTNode;

    private resources: ViewResources;
    private bindingLanguage: TemplatingBindingLanguage;
    private container: Container;

    constructor() {
        super();

        this.container = new Container();
        this.resources = this.container.get(ViewResources);
        this.bindingLanguage = this.container.get(TemplatingBindingLanguage);
    }

    init(parser: Parser) {
        var current = new ASTNode();
        this.root = current;

        parser.on("startTag", (tag, attrs, selfClosing, loc) => {
            let next = new ASTElementNode();
            next.tag = tag;
            next.parent = current;
            next.location = new FileLoc(loc.line, loc.col);
            next.attrs = attrs.map((x, i) => {
                var attrLoc = loc.attrs[x.name];
                var attr = new ASTAttribute();
                attr.name = x.name;
                attr.instruction = this.createAttributeInstruction(tag, x.name, x.value, attrLoc.line, attrLoc.col);
                attr.location = new FileLoc(attrLoc.line, attrLoc.col);
                return attr;
            });

            current.children.push(next);
            current = next;
        });

        parser.on("endTag", (tag, attrs, selfClosing, loc) => {
            current = current.parent;
        });

        parser.on("text", (text, loc) => {
            let child = new ASTTextNode();
            child.parent = current;
            child.expression = this.createTextExpression(text, loc.line, loc.col);
            child.location = new FileLoc(loc.line, loc.col);
            current.children.push(child);
        });
    }

    private createAttributeInstruction(tag: string, name: string, value: string, line: number, column: number): BehaviorInstruction {

        var instruction: BehaviorInstruction = null;

        try {
            let info: any = this.bindingLanguage.inspectAttribute(this.resources, tag, name, value);
            if (info)
                instruction = this.bindingLanguage.createAttributeInstruction(this.resources, { tagName: tag }, info, undefined);
        } catch (error) {
            this.reportSyntaxIssue(error, line, column);
        }

        return instruction;
    }

    private createTextExpression(text: string, line: number, column: number): InterpolationBindingExpression {

        var exp: InterpolationBindingExpression = null;

        try {
            exp = this.bindingLanguage.inspectTextContent(this.resources, text);
        } catch (error) {
            this.reportSyntaxIssue(error, line, column);
        }
        return exp;
    }

    private reportSyntaxIssue(error: Error, line: number, column: number) {

        let shorter = error.message.split(/\./);

        let msg = shorter ? shorter[0] : error.message.trim();
        let detail = shorter && shorter.length > 1 ? shorter.splice(1).join().trim() : null;

        let issue = new Issue({
            message: msg,
            detail: detail,
            line: line,
            column: column,
            severity: IssueSeverity.Error
        });

        this.reportIssue(issue);
    }
}

export class FileLoc {
    constructor(public line: number, public column: number) {
    }
}

export class ASTContext {
    name: string;
    type: string;
    typeDecl: ts.DeclarationStatement;
    typeValue: Object;

    constructor(init?: {
        name?: string,
        type?: string,
        typeDecl?: ts.DeclarationStatement,
        typeValue?: Object,
    }) {
        this.name = null;
        this.type = null;
        this.typeDecl = null;
        this.typeValue = null;

        if (init)
            Object.assign(this, init);
    }
}

export class ASTNode {
    public context: ASTContext;
    public locals: ASTContext[];
    public parent: ASTNode;
    public children: ASTNode[];
    public location: FileLoc;

    constructor() {
        this.parent = null;
        this.children = [];
        this.locals = [];
        this.context = null;
        this.location = null;
    }

    addChild(node: ASTNode) {
        if (this.children.indexOf(node) == -1)
            this.children.push(node);
    }
}

export class ASTAttribute {
    public name: string;
    public instruction: BehaviorInstruction;
    public location: FileLoc;
}

export class ASTElementNode extends ASTNode {
    public tag: string;
    public attrs: ASTAttribute[];

    constructor() {
        super()
    }
}

export class ASTTextNode extends ASTNode {
    public expression: InterpolationBindingExpression;

    constructor() {
        super();
    }
}

export interface BehaviorInstruction {
    initiatedByBehavior: boolean;
    enhance: boolean;
    partReplacements: any;
    viewFactory: any;
    originalAttrName: string;
    skipContentProcessing: boolean;
    contentFactory: any;
    viewModel: Object;
    anchorIsContainer: boolean;
    host: Element;
    attributes: Object;
    type: HtmlBehaviorResource;
    attrName: string;
    inheritBindingContext: boolean;
}

export interface InterpolationBindingExpression {

}