import { ASTElementAttribute, ASTElementNode, ASTTextNode, ASTNode } from '../../../ast';

import { Options } from '../../../options';
import { Content, ContentLocation } from '../../../content';
import { ParserHook } from '../parser-hook';
import { Parser } from '../parser';

export class ASTGenHook extends ParserHook {
  public root: ASTNode | null = null;

  constructor(private opts: Options) { super(); }

  protected hook() {

    var current: ASTNode | null = this.root = new ASTNode();

    this.parser.on("startTag", (tag, attrs, selfClosing, loc) => {
      let next = new ASTElementNode();
      next.name = tag;
      next.parent = current;
      if (loc == null) throw new Error("loc is " + loc);
      next.location = { start: loc.startOffset, end: loc.endOffset, line: loc.line, column: loc.col };
      next.attrs = attrs.map((x, i) => {
        var attr = new ASTElementAttribute();

        attr.name = (x.prefix !== undefined && x.prefix != "") ? `${x.prefix}:${x.name}` : x.name;

        var attrLoc = loc.attrs[attr.name] || loc.attrs[attr.name.toLowerCase()];

        if (attrLoc == undefined)
          attrLoc = { startOffset: -1, endOffset: -1, line: -1, col: -1 };

        attr.location = { start: attrLoc.startOffset, end: attrLoc.endOffset, line: attrLoc.line, column: attrLoc.col };

        attr.value = x.value;

        return attr;
      });

      current!.children.push(next);

      if (!this.parser.isVoid(tag))
        current = next;
    });

    this.parser.on("endTag", (tag, attrs, selfClosing, loc) => {
      current = current!.parent;
    });

    this.parser.on("text", (text, loc) => {
      if (loc == null) throw new Error("loc is " + loc);
      let child = new ASTTextNode();
      child.parent = current;
      child.location = { start: loc.startOffset, end: loc.endOffset, line: loc.line, column: loc.col };
      current!.children.push(child);
    });
  }
  finalise() {
    this.context.content["ast"] = this.root;
  }
}
