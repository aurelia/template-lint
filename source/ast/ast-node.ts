
import { ASTContext } from './ast-context';
import { ASTLocation } from './ast-location';
import { ASTElementAttribute } from './ast-element-attribute';

export class ASTNode {
  public context: ASTContext = null;
  public locals: ASTContext[] = [];
  public parent: ASTNode = null;
  public children: ASTNode[] = [];
  public location: ASTLocation = null;

  constructor(opt?: {
    context?: ASTContext,
    locals?: ASTContext[],
    parent?: ASTNode,
    children?: ASTNode[],
    location?: ASTLocation,
  }) {
    if (opt) {
      this.context = opt.context;
      this.locals = opt.locals || [];
      this.parent = opt.parent;
      this.children = opt.children || [];
      this.location = opt.location;
    }
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
