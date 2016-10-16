
import { FileLocation } from '../file-location';

import { ASTContext } from './ast-context';
import { ASTElementAttribute } from './ast-element-attribute';

export class ASTNode {
  public context: ASTContext | null = null;
  public locals: ASTContext[] = [];
  public parent: ASTNode | null = null;
  public children: ASTNode[] = [];
  public location: FileLocation | null = null;

  constructor(opt?: {
    context?: ASTContext,
    locals?: ASTContext[],
    parent?: ASTNode,
    children?: ASTNode[],
    location?: FileLocation,
  }) {
    if (opt) {
      this.context = opt.context || null;
      this.locals = opt.locals || [];
      this.parent = opt.parent || null;
      this.children = opt.children || [];
      this.location = opt.location || null;
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
    let tmpNode: ASTNode | null = node;

    if (ancestor) {
      while (tmpNode != null && ancestor >= 0) {
        tmpNode = tmpNode.parent;
        ancestor -= 1;
      }
    }

    while (tmpNode != null) {
      tmpNode.locals.forEach(x => {
        let index = locals.findIndex(y => y.name == x.name);

        if (index == -1)
          locals.push(x);
      });

      tmpNode = tmpNode.parent;
    }

    return locals;
  }

  public static inheritContext(node: ASTNode, ancestor?: number): ASTContext | null {
    let tmpNode: ASTNode | null = node;
    if (ancestor) {
      while (tmpNode != null && ancestor >= 0) {
        tmpNode = tmpNode.parent;
        ancestor -= 1;
      }
    }

    while (tmpNode != null) {
      if (tmpNode.context != null)
        return tmpNode.context;
      tmpNode = tmpNode.parent;
    }
    return null;
  }

  static async traverse(node: ASTNode, visit: (ASTNode) => Promise<void>) {
    await visit(node);

    let children = node.children;
    for (let child of children) {
      await ASTNode.traverse(child, visit);
    }
  }
}
