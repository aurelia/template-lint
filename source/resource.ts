import * as ts from 'typescript';

export enum ResourceKind {
  Unknown = 0,
  CustomElement,
  CustomAttribute,
  BindingBehaviour,
  ValueConverter,
}

export class Resource {
  constructor(public name: string, public kind: ResourceKind, public decl: ts.ClassDeclaration) {
  }
}
