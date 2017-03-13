import { SAXParser, StartTagLocationInfo, ASTAttribute } from 'parse5';
import { Issue, IssueSeverity } from '../../issue';

/**
 *  Helper to maintain the current state of open tags  
 */
export class ParserState {
  private scopes: string[];
  private voids: string[];

  public stack: ParserStateNode[];
  public issues: Issue[];

  public scope: string;
  public nextScope?: string;
  public nextNode?: ParserStateNode;

  constructor(scopes?: string[], voids?: string[]) {
    if (scopes === undefined) {
      scopes = ['html', 'body', 'template', 'svg', 'math'];
    }

    if (voids === undefined) {
      voids = ['area', 'base', 'br', 'col', 'embed', 'hr',
        'img', 'input', 'keygen', 'link', 'meta',
        'param', 'source', 'track', 'wbr'];
    }

    this.scopes = scopes;
    this.voids = voids;
  }

  initPreHooks(parser: SAXParser): void {
    this.stack = [];
    this.issues = [];

    const stack = this.stack;

    parser.on("startTag", (name, attrs, selfClosing, location) => {
      delete this.nextScope;
      delete this.nextNode;

      if (stack.length > 0 && stack[stack.length - 1].isVoid) {
        this.popStack();
      }

      const isVoid = this.isVoid(name);

      if (!selfClosing) {
        let nextScope = "";

        if (stack.length > 0) {
          nextScope = stack[stack.length - 1].scope;
        }

        if (this.isScope(name)) {
          nextScope = name;
        }

        this.nextScope = nextScope;
        if (location === undefined) { throw new Error("location is " + location); }
        this.nextNode = new ParserStateNode(this.nextScope, name, attrs, isVoid, location);
      }
    });

    parser.on("endTag", (name, loc) => {

      if (stack.length > 0 && stack[stack.length - 1].isVoid) {
        this.popStack();
      }

      if (this.isVoid(name)) {
        if (loc === undefined) { throw new Error("loc is " + loc); }
        const issue: Issue = {
          message: "void elements should not have a closing tag",
          severity: IssueSeverity.Error,
          location: {
            line: loc.line,
            column: loc.col,
            start: loc.startOffset,
            end: loc.endOffset
          }
        };
        this.issues.push(issue);
      }
      else if (stack.length <= 0 || stack[stack.length - 1].name !== name) {
        if (loc === undefined) { throw new Error("loc is " + loc); }
        let issue: Issue = {
          message: "mismatched close tag",
          severity: IssueSeverity.Error,
          location: {
            line: loc.line,
            column: loc.col,
            start: loc.startOffset,
            end: loc.endOffset
          }
        };
        this.issues.push(issue);
      }
      else {
        this.popStack();
      }
    });
  }

  initPostHooks(parser: SAXParser): void {
    parser.on("startTag", () => {
      if (this.nextScope !== undefined) {
        this.scope = this.nextScope;
      }

      delete this.nextScope;

      if (this.nextNode !== undefined) {
        this.stack.push(this.nextNode);
      }
      delete this.nextNode;
    });
  }

  finalise(): void {
    const stack = this.stack;

    if (stack.length > 0) {
      const element = stack[stack.length - 1];
      const issue: Issue = {
        message: "suspected unclosed element detected",
        severity: IssueSeverity.Error,
        location: {
          line: element.location.line,
          column: element.location.col,
          start: element.location.startOffset,
          end: element.location.endOffset
        }
      };
      this.issues.push(issue);
    }
  }

  public isVoid(name: string): boolean {
    return this.voids.indexOf(name) >= 0;
  }

  public isScope(name: string): boolean {
    return this.scopes.indexOf(name) >= 0;
  }

  private popStack(): void {
    const stack = this.stack;

    stack.pop();
    if (stack.length > 0) {
      this.scope = stack[stack.length - 1].scope;
    }
    else {
      this.scope = "";
    }
  }
}

/**
 *  Node in parser traversal stack
 */
export class ParserStateNode {
  constructor(
    public scope: string,
    public name: string,
    public attrs: ASTAttribute[],
    public isVoid: boolean,
    public location: StartTagLocationInfo) {
  }
}
