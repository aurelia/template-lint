
import ts = require('typescript');
import parse5 = require('parse5');

export class Context {
    name: string;
    type: string;
    typeDecl: ts.Declaration;
    typeValue: Object;
}

export class AccessScope {
    name: string;
    ancestor: number;
    next: AccessMember;
}

export class AccessMember {
    name: string;
    next: AccessMember;
}

export class Attribute {
    name: string;    
}

export abstract class ASTNode {
    public context: Context;
    public locals: Context[];
    public parent: ASTNode;
    public children: ASTNode[];

    constructor(init?: {
        context: Context,
        locals: Context[],
        parent: ASTNode,
        children: ASTNode[]
    }) {
        this.parent = null;
        this.children = [];
        this.locals = [];
        this.context = null;
    }

    addChild(node: ASTNode) {
        if (this.children.indexOf(node) != -1)
            this.children.push()
    }
}

export class ElementNode extends ASTNode {
    constructor(init: {
        tag: string,
        attrs: parse5.Attribute[]
    }) {
    }
}

export class TextNode extends ASTNode {
    parts: string | AccessScope

    constructor(init: { element: string }) {
        super();
    }
}