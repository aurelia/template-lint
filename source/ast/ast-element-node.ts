import { ASTNode } from './ast-node';
import { ASTElementAttribute } from './ast-element-attribute';

export class ASTElementNode extends ASTNode {
  public tag: string;
  public namespace?: string;
  public attrs: ASTElementAttribute[];

  constructor() {
    super();
  }
}
