import { Declaration, TypeNode  } from 'typescript';

export interface ASTContext {
  name: string;
  type: TypeNode;
  typeDecl: Declaration;
  typeValue: Object;
}
