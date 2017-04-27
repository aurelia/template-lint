
import { Content, SourceFile } from '../content';
import { ContentContext } from '../context';
import { IssueSeverity } from '../issue';
import { Options } from '../options';
import { Reflection } from '../reflection';
import { Resource, ResourceKind } from '../resource';
import { CaseConvert } from '../utils/case-convert';

import * as ts from 'typescript';

/** Extract Aurelia Resources */
export class SourceResourcesTask {
  constructor(private opts: Options) { }

  async process(ctx: ContentContext): Promise<boolean | undefined> {
    if (Content.isSourceContent(ctx.content)) {
      this.processResources(<ContentContext & { content: SourceFile }>ctx);
    }
    return false;
  }

  private processResources(ctx: ContentContext & { content: SourceFile }): void {
    const source = ctx.content.source;

    for (const decl of Reflection.getExportedClasses(source)) {
      this.processResource(ctx, decl);
    }
  }

  private processResource(ctx: ContentContext & { content: SourceFile }, decl: ts.ClassDeclaration): void {
    let decorators = decl.decorators || [];
    let explicitMeta = false;

    for (const decorator of decorators) {
      const exp = decorator.expression;

      if (Reflection.isCallExpression(exp)) {
        let callStr = exp.expression.getText();
        let args = exp.arguments;

        let customElement = "customElement";
        let customAttribute = "customAttribute";
        let valueConverter = "valueConverter";
        let bindingBehaviour = "bindingBehaviour";

        let metaCall: string;
        let resourceKind: ResourceKind;

        switch (callStr) {
          case customElement:
            metaCall = customElement;
            resourceKind = ResourceKind.CustomElement;
            break;
          case customAttribute:
            metaCall = customAttribute;
            resourceKind = ResourceKind.CustomAttribute;
            break;
          case valueConverter:
            metaCall = valueConverter;
            resourceKind = ResourceKind.ValueConverter;
            break;
          case bindingBehaviour:
            metaCall = bindingBehaviour;
            resourceKind = ResourceKind.BindingBehaviour;
            break;
          default:
            continue;
        }

        if (explicitMeta) {
          this.reportMultipleMetaDecorator(metaCall, ctx, decorator.getStart(), decorator.getEnd());
          return;
        }

        explicitMeta = true;

        if (args.length !== 1 || args[0].kind !== ts.SyntaxKind.StringLiteral) {
          this.reportUnknownMetaCall(metaCall, ctx, decorator.getStart(), decorator.getEnd());
          continue;
        }

        let resourceName = args[0].getText().replace(/("|'|`)/g, "");

        this.registerResource({ name: resourceName, kind: resourceKind, decl: decl }, ctx);
      }
    }

    if (explicitMeta) {
      return;
    }

    const className = decl.name!.getText().trim();
    let strippedName: string;

    let resourceKind: ResourceKind;

    const CustomElement = "CustomElement";
    const CustomAttribute = "CustomAttribute";
    const ValueConverter = "ValueConverter";
    const BindingBehaviour = "BindingBehaviour";

    if (className.endsWith(CustomElement)) {
      strippedName = className.substring(0, className.length - CustomElement.length);
      resourceKind = ResourceKind.CustomElement;
    } else if (className.endsWith(CustomAttribute)) {
      strippedName = className.substring(0, className.length - CustomAttribute.length);
      resourceKind = ResourceKind.CustomAttribute;
    } else if (className.endsWith(ValueConverter)) {
      strippedName = className.substring(0, className.length - ValueConverter.length);
      resourceKind = ResourceKind.ValueConverter;
    } else if (className.endsWith(BindingBehaviour)) {
      strippedName = className.substring(0, className.length - BindingBehaviour.length);
      resourceKind = ResourceKind.BindingBehaviour;
    }
    else {
      return;
    }

    let convertedName = CaseConvert.camelToKebabCase(strippedName);

    this.registerResource({ name: convertedName, kind: resourceKind, decl: decl }, ctx);
  }

  private registerResource(resource: Resource, ctx: ContentContext & { content: SourceFile }): void {
    ctx.content.resources = ctx.content.resources || [];
    ctx.content.resources.push(resource);
  }

  private reportUnknownMetaCall(method: string, ctx: ContentContext, start: number, end: number): void {
    ctx.issues.push({
      message: `unknown argument case for ${method} decorator`,
      severity: IssueSeverity.Debug,
      location: { start: start, end: end }
    });
  }

  private reportMultipleMetaDecorator(method: string, ctx: ContentContext, start: number, end: number): void {
    ctx.issues.push({
      message: `more than one aurelia meta decorator`,
      severity: IssueSeverity.Error,
      location: { start: start, end: end }
    });
  }
}
