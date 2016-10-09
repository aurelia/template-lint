import { ASTNode } from './ast-node';
import { ASTElementAttribute } from './ast-element-attribute';
import { ClassDeclaration } from 'typescript';

export class ASTElementNode extends ASTNode {
  public name: string;
  public namespace?: string;
  public attrs: ASTElementAttribute[];
  public typeValue: HTMLElement; 
  public typeDecl: ClassDeclaration;
  
  constructor() {
    super();
  }
}
