import { ASTElementAttribute, ASTElementNode, ASTTextNode, ASTLocation, ASTNode } from '../../../ast';
import { File } from '../../../file';
import { ParserHook } from '../parser-hook';
import { Parser } from '../parser';
import { Options } from '../../../options';


export class ASTGenerator extends ParserHook {
  public root: ASTNode = null;

  constructor(private opts:Options) { super(); }

  init(parser: Parser, file: File) {

    var current = this.root = new ASTNode();

    parser.on("startTag", (tag, attrs, selfClosing, loc) => {
      let next = new ASTElementNode();
      next.name = tag;
      next.parent = current;
      next.location = <ASTLocation>{ start: loc.startOffset, end: loc.endOffset, line: loc.line, column: loc.col, path: file.path };
      next.attrs = attrs.map((x, i) => {
        var attr = new ASTElementAttribute();

        attr.name = (x.prefix !== undefined && x.prefix != "") ? `${x.prefix}:${x.name}` : x.name;

        var attrLoc = loc.attrs[attr.name] || loc.attrs[attr.name.toLowerCase()];

        if (attrLoc == undefined)
          attrLoc = { startOffset: -1, endOffset: -1, line: -1, col: -1 };

        attr.location = <ASTLocation>{ start: attrLoc.startOffset, end: attrLoc.endOffset, line: attrLoc.line, column: attrLoc.col, path: file.path  };

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
      child.location = <ASTLocation>{ start: loc.startOffset, end: loc.endOffset, line: loc.line, column: loc.col, path: file.path  };
      current.children.push(child);
    });
  }
}
