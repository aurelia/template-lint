import { ContentLocation } from '../content';
import { ASTContext } from './ast-context';

export class ASTNode {
  public context?: ASTContext;
  public locals: ASTContext[] = [];
  public parent?: ASTNode;
  public children: ASTNode[] = [];
  public location: ContentLocation;

  constructor(opt?: {
    context?: ASTContext,
    locals?: ASTContext[],
    parent?: ASTNode,
    children?: ASTNode[],
    location: ContentLocation,
  }) {
    Object.assign(this, opt);
  }

  addChild(node: ASTNode): void {
    if (this.children.indexOf(node) === -1) {
      this.children.push(node);
      node.parent = this;
    }
  }

  public static inheritLocals(node: ASTNode, ancestor?: number): ASTContext[] {
    let locals: ASTContext[] = [];
    let tmpNode: ASTNode | undefined = node;

    if (ancestor) {
      while (tmpNode !== undefined && ancestor >= 0) {
        tmpNode = tmpNode.parent;
        ancestor -= 1;
      }
    }

    while (tmpNode !== undefined) {
      tmpNode.locals.forEach(x => {
        let index = locals.findIndex(y => y.name === x.name);

        if (index === -1) {
          locals.push(x);
        }
      });

      tmpNode = tmpNode.parent;
    }

    return locals;
  }

  public static inheritContext(node: ASTNode, ancestor?: number): ASTContext | undefined {
    let tmpNode: ASTNode | undefined = node;
    if (ancestor) {
      while (tmpNode !== undefined && ancestor >= 0) {
        tmpNode = tmpNode.parent;
        ancestor -= 1;
      }
    }

    while (tmpNode !== undefined) {
      if (tmpNode.context !== undefined) {
        return tmpNode.context;
      }
      tmpNode = tmpNode.parent;
    }
    return undefined;
  }

  static async descend(node: ASTNode, visit: (node: ASTNode) => Promise<boolean>): Promise<boolean> {
    for (let child of node.children) {
      if (await visit(child) === false) {
        break;
      }
      if (await ASTNode.descend(child, visit) === false) {
        break;
      }
    }
    return true;
  }

  static async ascend(node: ASTNode, visit: (node: ASTNode) => Promise<boolean>): Promise<void> {
    if (node.parent) {
      if (await visit(node.parent) === false) {
        return;
      }
      await ASTNode.ascend(node.parent, visit);
    }
  }
}
