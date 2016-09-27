import { TemplatingBindingLanguage, InterpolationBindingExpression } from 'aurelia-templating-binding';
import { AccessMember, AccessScope, AccessKeyed, NameExpression, ValueConverter } from 'aurelia-binding';
import { Container } from 'aurelia-dependency-injection';
import { Rule, Parser, ParserState, Issue, IssueSeverity } from 'template-lint';
import ts = require('typescript');

import {
  ViewResources,
  BindingLanguage,
  BehaviorInstruction,
  HtmlBehaviorResource,
  ViewFactory
}
  from 'aurelia-templating';
import { ASTAttribute as P5ASTAttribute } from "parse5";

export class ASTBuilder extends Rule {
  public root: ASTNode;
  public reportBindingSyntax = true;

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
      next.attrs = attrs.map((x: P5ASTAttribute, i) => {
        var attr = new ASTAttribute();     
        attr.name = (x.prefix !== undefined && x.prefix != "") ? `${x.prefix}:${x.name}` : x.name;
        var attrLoc = loc.attrs[attr.name] || loc.attrs[attr.name.toLowerCase()];
                
        attr.name = x.name;
        attr.instruction = this.createAttributeInstruction(tag, x.name, x.value, attrLoc.line, attrLoc.col);
        attr.location = new FileLoc(attrLoc.line, attrLoc.col);
        return attr;
      });

      current.children.push(next);
      if (!parser.isVoid(tag))
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

  private createAttributeInstruction(tag: string, name: string, value: string, line: number, column: number): any {

    var instruction: any = null;

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

    if (this.reportBindingSyntax)
      this.reportIssue(issue);
  }
}

export class FileLoc {
  constructor(public line: number, public column: number) {
  }
}

export class ASTContext {
  name: string = null;
  type: ts.TypeNode = null;
  typeDecl: ts.Declaration = null;
  typeValue: Object = null;

  constructor(init?: {
    name?: string,
    type?: ts.TypeNode,
    typeDecl?: ts.Declaration,
    typeValue?: Object
  }) {
    if (init)
      Object.assign(this, init);
  }
}

export class ASTNode {
  public context: ASTContext = null;
  public locals: ASTContext[] = [];
  public parent: ASTNode = null;
  public children: ASTNode[] = [];
  public location: FileLoc = null;

  constructor(init?: {
    context?: ASTContext,
    locals?: ASTContext[],
    parent?: ASTNode,
    children?: ASTNode[],
    location?: FileLoc,
  }) {
    if (init)
      Object.assign(this, init);
  }

  addChild(node: ASTNode) {
    if (this.children.indexOf(node) == -1) {
      this.children.push(node);
      node.parent = this;
    }
  }

  public static inheritLocals(node: ASTNode, ancestor?: number): ASTContext[] {
    let locals: ASTContext[] = [];

    if (ancestor) {
      while (node != null && ancestor >= 0) {
        node = node.parent;
        ancestor -= 1;
      }
    }

    while (node != null) {
      node.locals.forEach(x => {
        let index = locals.findIndex(y => y.name == x.name);

        if (index == -1)
          locals.push(x);
      });

      node = node.parent;
    }

    return locals;
  }

  public static inheritContext(node: ASTNode, ancestor?: number): ASTContext {
    if (ancestor) {
      while (node != null && ancestor >= 0) {
        node = node.parent;
        ancestor -= 1;
      }
    }

    while (node != null) {
      if (node.context != null)
        return node.context;
      node = node.parent;
    }
    return null;
  }
}

export class ASTAttribute {
  public name: string;
  public instruction: any;
  public location: FileLoc;
}

export class ASTElementNode extends ASTNode {
  public tag: string;
  public attrs: ASTAttribute[];

  constructor() {
    super();
  }
}

export class ASTTextNode extends ASTNode {
  public expression: InterpolationBindingExpression;

  constructor() {
    super();
  }
}
