import { FileTask } from '../file-task';
import { File, FileKind, FileLocation } from '../file';
import { IFile, ISourceFile, IHtmlFile } from '../file';
import { Fetch } from '../fetch';
import { Issue, IssueSeverity } from '../issue';
import { Options } from '../options';
import { ASTNode, ASTElementNode } from '../ast';
import { ASTGenHook } from './parser/hooks/ast-generator';
import { SelfCloseHook } from './parser/hooks/self-close';
import { Reflection } from '../reflection';
import { Resource, ResourceKind } from '../resource';
import { CaseConvert } from '../utils/case-convert'; 

import * as ts from 'typescript';

/** Extract Aurelia Resources */
export class SourceResourcesTask implements FileTask {
  constructor(private opts: Options) { }

  async process(file: File, fetch: Fetch): Promise<boolean> {
    if (file.isSourceFile()) {
      this.processResources(file);
    }
    return false;
  }

  private processResources(file: ISourceFile) {
    const source = file.source;
    const exportedClasses = Reflection.getExportedClasses(source);

    for (var decl of Reflection.getExportedClasses(source)) {
      this.processResource(file, decl);
    }
  }

  private processResource(file: ISourceFile, decl: ts.ClassDeclaration) {
    let decorators = decl.decorators || [];
    let explicitMeta = false;

    for (var decorator of decorators) {
      var exp = decorator.expression;

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
          this.reportMultipleMetaDecorator(metaCall, file, decorator.getStart(), decorator.getEnd());
          return;
        }

        explicitMeta = true;

        if (args.length != 1 || args[0].kind != ts.SyntaxKind.StringLiteral) {
          this.reportUnknownMetaCall(metaCall, file, decorator.getStart(), decorator.getEnd());
          continue;
        }

        let resourceName = args[0].getText().replace(/("|'|`)/g, "");

        this.registerResource(resourceName, resourceKind, decl, file);
      }
    }

    if (explicitMeta)
      return;

    const className = decl.name!.getText().trim();
    let strippedName: string;

    let metaCall: string;
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
    else return;

    let convertedName = CaseConvert.camelToKebabCase(strippedName);

    this.registerResource(convertedName, resourceKind, decl, file);
  }

  private registerResource(name: string, kind: ResourceKind, decl: ts.ClassDeclaration, file: ISourceFile) {
    file.resources = file.resources || [];
    file.resources.push(new Resource(name, kind, decl));
  }

  

  

  private reportUnknownMetaCall(method: string, file: IFile, start: number, end: number) {
    file.issues.push({
      message: `unknown argument case for ${method} decorator`,
      severity: IssueSeverity.Debug,
      location: new FileLocation({ start: start, end: end })
    });
  }

  private reportMultipleMetaDecorator(method: string, file: IFile, start: number, end: number) {
    file.issues.push({
      message: `more than one aurelia meta decorator`,
      severity: IssueSeverity.Error,
      location: new FileLocation({ start: start, end: end })
    });
  }
}
