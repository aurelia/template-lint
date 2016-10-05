import { ASTLocation } from './ast-location';

export class ASTElementAttribute {
  public name: string;
  public namespace: string;
  public value: string;
  public location: ASTLocation;
}
