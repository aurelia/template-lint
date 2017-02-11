import * as ts from 'typescript';

export interface Resource {
  name: string;
  kind: ResourceKind;
  decl: ts.ClassDeclaration;
}

export enum ResourceKind {
  Unknown = 0,
  CustomElement,
  CustomAttribute,
  BindingBehaviour,
  ValueConverter,
}
