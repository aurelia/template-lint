import { ASTNode } from './ast-node';

export class ASTTextNode extends ASTNode {
  public content: string;

  constructor() {
    super();
  }
}
