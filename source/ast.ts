export * from './ast/ast-context';
export * from './ast/ast-element-attribute';
export * from './ast/ast-element-node';
export * from './ast/ast-location';
export * from './ast/ast-node';
export * from './ast/ast-text-node';

import { ASTElementAttribute } from './ast/ast-element-attribute';
import { ASTElementNode } from './ast/ast-element-node';
import { ASTTextNode } from './ast/ast-text-node';
import { ASTLocation } from './ast/ast-location';
import { ASTNode } from './ast/ast-node';
import { ParserTask } from './parser-task';
import { Parser } from './parser';

export class ASTGen extends ParserTask {
  public root: ASTNode = null;

  constructor() { super(); }

  init(parser: Parser, path?: string) {

    var current = this.root = new ASTNode();

    parser.on("startTag", (tag, attrs, selfClosing, loc) => {
      let next = new ASTElementNode();
      next.tag = tag;
      next.parent = current;
      next.location = <ASTLocation>{ start: loc.startOffset, end: loc.endOffset, line: loc.line, column: loc.col, path: path };
      next.attrs = attrs.map((x, i) => {
        var attr = new ASTElementAttribute();

        attr.name = (x.prefix !== undefined && x.prefix != "") ? `${x.prefix}:${x.name}` : x.name;

        var attrLoc = loc.attrs[attr.name] || loc.attrs[attr.name.toLowerCase()];

        if (attrLoc == undefined)
          attrLoc = { startOffset: -1, endOffset: -1, line: -1, col: -1 };

        attr.location = <ASTLocation>{ start: attrLoc.startOffset, end: attrLoc.endOffset, line: attrLoc.line, column: attrLoc.col, path: path };

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
      child.location = <ASTLocation>{ start: loc.startOffset, end: loc.endOffset, line: loc.line, column: loc.col, path: path };
      current.children.push(child);
    });
  }
}
