import * as ts from 'typescript';

export enum ResourceKind {
  Unknown = 0,
  Element,
  Attribute,
  BindingBehaviour,
  Converter,
}

export class Resource {
  constructor(public kind: ResourceKind, public decl: ts.ClassDeclaration) {
  }
}
