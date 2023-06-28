"use strict";

import "aurelia-polyfills";

import { TemplatingBindingLanguage, InterpolationBindingExpression } from "aurelia-templating-binding";
import { ViewResources, BindingLanguage, BehaviorInstruction } from "aurelia-templating";
import { AccessMember, AccessScope, AccessKeyed, Expression, NameExpression, ValueConverter, ListenerExpression } from "aurelia-binding";
import { Container } from "aurelia-dependency-injection";
import * as ts from "typescript";
import * as Path from "path";

import { Rule, Parser, ParserState, Issue, IssueSeverity } from "template-lint";
import { Reflection } from "../reflection";
import { AureliaReflection } from '../aurelia-reflection';

import {
  ASTBuilder,
  ASTElementNode,
  ASTTextNode,
  ASTNode,
  ASTAttribute,
  ASTContext,
  FileLoc
} from "../ast";
import Node = ts.Node;
import NodeArray = ts.NodeArray;
import Decorator = ts.Decorator;
import Identifier = ts.Identifier;

/**
 *  Rule to ensure static type usage is valid
 */
export class BindingRule extends ASTBuilder {
  public reportBindingAccess = true;
  public reportExceptions = false;
  public reportUnresolvedViewModel = false;

  public localProvidors = ["ref", "repeat.for", "if.bind", "with.bind"];
  public restrictedAccess = ["private", "protected"];
  public localOverride?= new Map<string, Array<{ name: string, value: any }>>();

  constructor(
    private reflection: Reflection,
    auReflection: AureliaReflection,
    opt?: {
      reportBindingSyntax?: boolean,
      reportBindingAccess?: boolean,
      reportUnresolvedViewModel?: boolean,
      reportExceptions?: boolean,
      localProvidors?: string[],
      localOverride?: Map<string, Array<{ name: string, typeValue: any }>>
      restrictedAccess?: string[]
    }) {

    super(auReflection);

    if (opt)
      Object.assign(this, opt);
  }

  init(parser: Parser, path?: string) {
    super.init(parser);
    this.root.context = this.resolveViewModel(path);
  }

  finalise(): Issue[] {
    if (this.reportBindingAccess) {
      try {
        if (this.root.context != null)
          this.examineNode(this.root);
      } catch (error) {
        if (this.reportExceptions)
          this.reportIssue(new Issue({ message: error, line: -1, column: -1 }));
      }
    }
    return super.finalise();
  }

  private examineNode(node: ASTNode) {

    if (node instanceof ASTElementNode) {
      this.examineElementNode(node);

      //triage #77
      if (node.attrs.find(x => x.name == "slot" || x.name == "replace-part"))
        return;
    }
    else if (node instanceof ASTTextNode) {
      this.examineTextNode(node);
    }

    if (node.children == null)
      return;

    node.children.forEach(child => {
      this.examineNode(child);
    });
  }

  private examineElementNode(node: ASTElementNode) {
    let attrs = node.attrs.sort((a, b) => {
      var ai = this.localProvidors.indexOf(a.name);
      var bi = this.localProvidors.indexOf(b.name);

      if (ai == -1 && bi == -1)
        return 0;

      if (ai == -1)
        return 1;

      if (bi == -1)
        return -1;

      return ai < bi ? -1 : 1;
    });

    if (this.localOverride.has(node.tag)) {
      node.locals.push(...this.localOverride.get(node.tag).map(x => new ASTContext(x)));
    }

    for (let i = 0, ii = attrs.length; i < ii; ++i) {
      let attr = attrs[i];
      this.examineAttribute(node, attr);
    }
  }

  private examineTextNode(node: ASTTextNode) {
    let exp = <any>node.expression;

    if (!exp)
      return;

    if (exp.constructor.name == "InterpolationBindingExpression")
      this.examineInterpolationExpression(node, exp);
  }

  private examineAttribute(node: ASTElementNode, attr: ASTAttribute) {
    let instruction = attr.instruction;

    if (instruction == null)
      return;

    let instructionName = instruction.constructor.name;

    switch (instructionName) {
      case "BehaviorInstruction": {
        this.examineBehaviorInstruction(node, <BehaviorInstruction>instruction);
        break;
      }
      case "ListenerExpression": {
        this.examineListenerExpression(node, <ListenerExpression>instruction);
        break;
      }
      case "NameExpression": {
        if (attr.name == "ref") {
          var name = instruction.sourceExpression.name;

          var root = this.resolveRoot(node);

          root.locals.push(new ASTContext({ name: name, type: <ts.TypeNode>ts.createNode(ts.SyntaxKind.AnyKeyword) }));
        }
        this.examineNameExpression(node, <NameExpression>instruction);

        break;
      }
      default: {
        if (this.reportExceptions)
          this.reportIssue(new Issue({ message: `Unknown instruction type: ${instructionName}`, line: attr.location.line }));
      }
    }
  }

  private examineBehaviorInstruction(node: ASTElementNode, instruction: BehaviorInstruction) {
    let attrName = instruction.attrName;
    let attrLoc = node.location;
    switch (attrName) {
      case "repeat": {

        let varKey = <string>instruction.attributes["key"];
        let varValue = <string>instruction.attributes["value"];
        let varLocal = <string>instruction.attributes["local"];
        let source = instruction.attributes["items"];
        let chain = this.flattenAccessChain(source.sourceExpression);
        let resolved = this.resolveAccessScopeToType(node, chain, new FileLoc(attrLoc.line, attrLoc.column));

        let type = resolved ? resolved.type : null;
        let typeDecl = resolved ? resolved.typeDecl : null;

        if (varKey && varValue) {
          node.locals.push(new ASTContext({ name: varKey, type: <ts.TypeNode>ts.createNode(ts.SyntaxKind.StringKeyword) }));
          node.locals.push(new ASTContext({ name: varValue, type: type, typeDecl: typeDecl }));
        }
        else {
          node.locals.push(new ASTContext({ name: varLocal, type: type, typeDecl: typeDecl }));
        }

        node.locals.push(new ASTContext({ name: "$index", type: <ts.TypeNode>ts.createNode(ts.SyntaxKind.NumberKeyword) }));
        node.locals.push(new ASTContext({ name: "$first", type: <ts.TypeNode>ts.createNode(ts.SyntaxKind.BooleanKeyword) }));
        node.locals.push(new ASTContext({ name: "$last", type: <ts.TypeNode>ts.createNode(ts.SyntaxKind.BooleanKeyword) }));
        node.locals.push(new ASTContext({ name: "$odd", type: <ts.TypeNode>ts.createNode(ts.SyntaxKind.BooleanKeyword) }));
        node.locals.push(new ASTContext({ name: "$even", type: <ts.TypeNode>ts.createNode(ts.SyntaxKind.BooleanKeyword) }));

        break;
      }
      case "with": {

        let source = instruction.attributes["with"];
        let chain = this.flattenAccessChain(source.sourceExpression);
        let resolved = this.resolveAccessScopeToType(node, chain, new FileLoc(attrLoc.line, attrLoc.column));

        if (resolved != null)
          node.context = resolved;

        break;
      }
      default:
        let attrExp = instruction.attributes[attrName];
        let access = instruction.attributes[attrName].sourceExpression;

        if (attrExp.constructor.name == "InterpolationBindingExpression")
          this.examineInterpolationExpression(node, attrExp);
        else {
          let chain = this.flattenAccessChain(access);
          let resolved = this.resolveAccessScopeToType(node, chain, new FileLoc(attrLoc.line, attrLoc.column));
        }
    };
  }

  private examineListenerExpression(node: ASTElementNode, exp: any /*ListenerExpression*/) {
    let target: string = exp.targetEvent;
    let access = exp.sourceExpression;
    let chain = this.flattenAccessChain(access);
    let resolved = this.resolveAccessScopeToType(node, chain, node.location);

    node.locals.push(new ASTContext({ name: "$event" }));
    for (var arg of access.args) {
      let access = arg;
      let chain = this.flattenAccessChain(access);
      let resolved = this.resolveAccessScopeToType(node, chain, node.location);
    }
    node.locals.pop();
  }

  private examineNameExpression(node: ASTElementNode, exp: any /*NamedExpression*/) {
    let access = exp.sourceExpression;
    let chain = this.flattenAccessChain(access);
    let resolved = this.resolveAccessScopeToType(node, chain, node.location);
  }

  private examineInterpolationExpression(node: ASTNode, exp: any) {
    if (!exp || !node)
      return;

    let lineOffset = 0;
    let column = node.location.column;

    exp.parts.forEach(part => {
      if (part.name !== undefined) {

        let chain = this.flattenAccessChain(part);

        if (chain.length > 0)
          this.resolveAccessScopeToType(node, chain, new FileLoc(node.location.line + lineOffset, column));

      }
      else if ((<string>part).match !== undefined) {
        let lines = (<string>part).split(/\n|\r/);

        if (lines && lines.length > 1) {
          lineOffset += lines.length;
          column = lines[lines.length - 1].length + 1;
        }
      }
    });
  }

  private resolveRoot(node: ASTNode): ASTNode {
    while (node.parent)
      node = node.parent;
    return node;
  }

  private resolveViewModel(path: string): ASTContext {
    if (!path || path.trim() == "")
      return null;

    let viewFileInfo = Path.parse(path);
    let viewModelFile = Path.join(viewFileInfo.dir, `${viewFileInfo.name}`);
    let viewName = this.toSymbol(viewFileInfo.name);

    let viewModelSource = this.reflection.pathToSource[viewModelFile] as ts.SourceFile;

    if (!viewModelSource) {
      if (this.reportUnresolvedViewModel) {
        this.reportIssue(
          new Issue({
            message: `no view-model source-file found`,
            detail: viewModelFile,
            line: -1,
            column: -1,
            severity: IssueSeverity.Warning
          }));
      }

      return null;
    }

    let classes = viewModelSource.statements.filter(
      x =>
        x.kind == ts.SyntaxKind.ClassDeclaration &&
        x.modifiers !== undefined &&
        x.modifiers.some(
          modifier => modifier.kind === ts.SyntaxKind.ExportKeyword
        )
    ) as ts.ClassDeclaration[];

    if (classes == null || classes.length == 0) {
      if (this.reportUnresolvedViewModel) {
        this.reportIssue(
          new Issue({
            message: `no classes found in view-model source-file`,
            detail: viewModelFile,
            line: -1,
            column: -1,
            severity: IssueSeverity.Warning
          }));
      }

      return null;
    }

    let first = classes[0];
    let context = new ASTContext();

    context.name = first.name.getText();
    context.typeDecl = first;

    return context;
  }

  private resolveAccessScopeToType(node: ASTNode, chain: any[], loc: FileLoc): ASTContext {
    let access = chain[0];
    let ancestor = <number>access.ancestor;

    let context = ASTNode.inheritContext(node, ancestor);
    let locals = ASTNode.inheritLocals(node, ancestor);

    return this.resolveAccessChainToType(node, context, locals, chain, loc);
  }

  private resolveAccessChainToType(node: ASTNode, context: ASTContext, locals: ASTContext[], chain: any[], loc: FileLoc): ASTContext {
    if (chain == null || chain.length == 0)
      return;

    let decl = context.typeDecl;
    let access = chain[0];
    let resolved: ASTContext = null;

    if (access.constructor.name == "AccessMember" ||
      access.constructor.name == "AccessScope" ||
      access.constructor.name == "CallMember" ||
      access.constructor.name == "CallScope") {
      let name = access.name;

      if (context.typeValue) {
        resolved = this.resolveValueContext(context.typeValue, name, loc);
      } else {
        if (!resolved)
          resolved = this.resolveLocalType(locals, name);

        if (!resolved)
          resolved = this.resolveStaticType(node, context, name, loc);
      };
    }
    else if (access.constructor.name == "AccessKeyed") {
      let keyAccess = access.key;
      let keyChain = this.flattenAccessChain(keyAccess);
      let keyTypeDecl = this.resolveAccessScopeToType(node, keyChain, loc);

      resolved = new ASTContext({ name: context.name, type: context.type, typeDecl: context.typeDecl });
    }

    if (!resolved) {
      return null;
    }

    if (chain.length == 1) {
      return resolved;
    }

    if (resolved.typeDecl == null) {
      return null;
    }

    return this.resolveAccessChainToType(node, resolved, null, chain.slice(1), loc);
  }

  private resolveValueContext(value: any, memberName: string, loc: FileLoc): ASTContext {
    if (!value)
      return null;

    let resolved = value[memberName];

    if (resolved === undefined) {
      this.reportUnresolvedAccessObjectIssue(memberName, value.constructor.name, loc);
      return null;
    }

    return new ASTContext({ name: memberName /*,typeValue: resolved*/ });
  }

  private resolveLocalType(locals: ASTContext[], memberName: string): ASTContext {

    if (!locals)
      return null;

    let localVar = locals.find(x => x.name == memberName);

    return localVar;
  }

  private resolveStaticType(node: ASTNode, context: ASTContext, memberName: string, loc: FileLoc): ASTContext {

    if (context == null || context.typeDecl == null)
      return null;

    let decl = context.typeDecl;
    let memberType: ts.TypeNode;
    let member: ts.ParameterDeclaration | ts.ClassElement | ts.TypeElement = null;

    switch (decl.kind) {
      case ts.SyntaxKind.ClassDeclaration: {
        const classDecl = <ts.ClassDeclaration>decl;

        let members = this.resolveClassMembers(classDecl);

        member = members
          .filter(x =>
            x.kind == ts.SyntaxKind.PropertyDeclaration ||
            x.kind == ts.SyntaxKind.MethodDeclaration ||
            x.kind == ts.SyntaxKind.GetAccessor)
          .sort((a, b) => hasModifier(a, ts.ModifierFlags.Static) - hasModifier(b, ts.ModifierFlags.Static))
          .find(x => (<any>x.name).text == memberName);

        if (member) {
          /* 
          //#140 - doesn't support 
          if (member.kind === ts.SyntaxKind.GetAccessor) {
            this.checkDecorators(node, member, context, loc);
          }
          */
          memberType = this.reflection.resolveClassElementType(member);
        } else {
          [member, memberType] = this.findMemberInCtorDecls(classDecl, memberName);
        }
        if (!member) {
          // "dynamic" members could be defined using index signature: `[x: string]: number;`
          member = members.filter(x => x.kind == ts.SyntaxKind.IndexSignature).pop();
        }
        if (!member)
          break;
      } break;
      case ts.SyntaxKind.InterfaceDeclaration: {
        let members = this.resolveInterfaceMembers(<ts.InterfaceDeclaration>decl);

        member = members
          .filter(x =>
            x.kind == ts.SyntaxKind.PropertySignature ||
            x.kind == ts.SyntaxKind.MethodSignature ||
            x.kind == ts.SyntaxKind.GetAccessor)
          .find(x => x.name.getText() === memberName);
        if (!member) {
          // "dynamic" members could be defined using index signature: `[x: string]: number;`
          member = members.filter(x => x.kind == ts.SyntaxKind.IndexSignature).pop();
        }
        if (!member)
          break;

        memberType = this.reflection.resolveTypeElementType(member);
      } break;
      default:
      //console.log("Unhandled Kind");
    }

    if (!member) {
      this.reportUnresolvedAccessMemberIssue(memberName, decl, loc);
      return null;
    }

    if (!memberType)
      return null;

    if (this.restrictedAccess.length > 0) {
      const isPrivate = hasModifier(member, ts.ModifierFlags.Private);
      const isProtected = hasModifier(member, ts.ModifierFlags.Protected);

      const restrictPrivate = this.restrictedAccess.indexOf("private") != -1;
      const restrictProtected = this.restrictedAccess.indexOf("protected") != -1;

      if (isPrivate && restrictPrivate || isProtected && restrictProtected) {
        const accessModifier = isPrivate ? "private" : "protected";
        this.reportPrivateAccessMemberIssue(memberName, decl, loc, accessModifier);
        return null;
      }
    }
    let memberTypeName = this.reflection.resolveTypeName(memberType);
    let memberTypeDecl: ts.Declaration = this.reflection.getDeclForType((<ts.SourceFile>decl.parent), memberTypeName);
    let memberIsArray = ('type' in member && member.type.kind == ts.SyntaxKind.ArrayType) || memberType.getText().startsWith("Array");

    //TODO:
    //let typeArgs = <args:ts.TypeReference[]> member.type.typeArguments;
    //The simpler solution here might be to create a copy of the generic type declaration and
    //replace the generic references with the arguments.

    return new ASTContext({ type: memberType, typeDecl: memberTypeDecl, typeValue: memberIsArray ? [] : null });
  }

  private findMemberInCtorDecls(classDecl: ts.ClassDeclaration, memberName: string): [ts.ParameterDeclaration, ts.TypeNode] {
    do {
      let members = classDecl.members;
      const constr = <ts.ConstructorDeclaration>members.find(ce => ce.kind == ts.SyntaxKind.Constructor);
      if (constr) {
        const param: ts.ParameterDeclaration = constr.parameters.find(parameter => parameter.name.getText() === memberName);
        const combinedFlags = ts.getCombinedModifierFlags(param);
        if (param && combinedFlags) {
          return [param, param.type];
        }
      }

      let currentClass = classDecl;

      classDecl = null;

      if (currentClass.heritageClauses != null && currentClass.heritageClauses.length > 0) {
        let extend = currentClass.heritageClauses.find(x => x.token == ts.SyntaxKind.ExtendsKeyword);
        if (extend) {
          let extendType = extend.types[0];

          let memberTypeDecl: ts.Declaration = this.reflection.getDeclForType((<ts.SourceFile>currentClass.parent), extendType.getText());

          if (memberTypeDecl != null && memberTypeDecl.kind == ts.SyntaxKind.ClassDeclaration) {
            classDecl = <ts.ClassDeclaration>memberTypeDecl;
          }
        }
      }
    } while (classDecl != null);

    return [null, null];
  }

  private checkDecorators(node: ASTNode, member, context: ASTContext, loc: FileLoc) {
    if (member.decorators) {
      const memberNode = <Node>member;
      const decorators: NodeArray<Decorator> = member.decorators;
      decorators.forEach((decorator) => {
        const decoratorExprNode = <any>decorator.expression;
        const expr = <Identifier>decoratorExprNode.expression;
        if (expr.text === "computedFrom") {
          var decoratorArguments = decoratorExprNode.arguments;
          const decoratorArgumentsAsText: string[] = decoratorArguments.map((decoratorArg) => decoratorArg.text);
          decoratorArgumentsAsText.forEach((computedDependencyText) => {
            var exp = this.auReflection.createTextExpression(`\$\{${computedDependencyText}\}`);
            if (exp) {
              this.examineInterpolationExpression(node, exp);
            }
          });
        }
      });
    }
  }

  private resolveClassMembers(classDecl: ts.ClassDeclaration): ts.NodeArray<ts.ClassElement> {
    var members = classDecl.members;

    if (!classDecl.heritageClauses)
      return members;

    for (let base of classDecl.heritageClauses) {
      for (let type of base.types) {
        let typeDecl = this.reflection.getDeclForType((<ts.SourceFile>classDecl.parent), type.getText());

        if (typeDecl != null) {
          let baseMembers = this.resolveClassMembers(<ts.ClassDeclaration>typeDecl);
          // #NodeArrayCast
          // This cast is safe because ts.createNodeArray simply creates an array and downcasts it to a read-only thing after adding some properties.
          // We want to keep those properties (so we use push instead of concat) and save the overhead of letting TS re-create the array with those props.
          (<NodeArray<ts.ClassElement> & ts.ClassElement[]>members).push(...baseMembers);
        }
      }
    }

    return members;
  }

  private resolveInterfaceMembers(interfaceDecl: ts.InterfaceDeclaration): ts.NodeArray<ts.TypeElement> {
    var members = interfaceDecl.members;

    if (!interfaceDecl.heritageClauses)
      return members;

    for (let base of interfaceDecl.heritageClauses) {
      for (let type of base.types) {
        let typeDecl = this.reflection.getDeclForType((<ts.SourceFile>interfaceDecl.parent), type.getText());

        if (typeDecl != null) {
          let baseMembers = this.resolveInterfaceMembers(<ts.InterfaceDeclaration>typeDecl);
          // See #NodeArrayCast for explanation
          (<NodeArray<ts.TypeElement> & ts.TypeElement[]>members).push(...baseMembers);
        }
      }
    }

    return members;
  }

  private flattenAccessChain(access) {
    let chain = [];

    while (access !== undefined) {
      if (access.constructor.name == "PrefixNot")
        access = access.expression;
      else {
        chain.push(access);
        access = access.object;
      }
    }

    return chain.reverse();
  }

  private toSymbol(path: string): string {
    path = this.toCamelCase(path.trim());
    return path.charAt(0).toUpperCase() + path.slice(1);
  }

  private toFile(symbol: string) {
    return this.toDashCase(symbol.trim());
  }

  private toCamelCase(value: string) {
    return value.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
  }

  private toDashCase(value: string) {
    return value.replace(/([a-z][A-Z])/g, function (g) { return g[0] + "-" + g[1].toLowerCase(); });
  }

  private reportUnresolvedAccessObjectIssue(member: string, objectName: string, loc: FileLoc) {
    let msg = `cannot find '${member}' in object '${objectName}'`;
    let issue = new Issue({
      message: msg,
      line: loc.line,
      column: loc.column,
      severity: IssueSeverity.Error
    });

    this.reportIssue(issue);
  }

  private reportUnresolvedAccessMemberIssue(member: string, decl: ts.NamedDeclaration, loc: FileLoc) {
    let msg = `cannot find '${member}' in type '${decl.name.getText()}'`;
    let issue = new Issue({
      message: msg,
      line: loc.line,
      column: loc.column,
      severity: IssueSeverity.Error
    });

    this.reportIssue(issue);
  }

  private reportPrivateAccessMemberIssue(member: string, decl: ts.NamedDeclaration, loc: FileLoc, accessModifier: string) {
    let msg = `field '${member}' in type '${decl.name.getText()}' has ${accessModifier} access modifier`;
    let issue = new Issue({
      message: msg,
      line: loc.line,
      column: loc.column,
      severity: IssueSeverity.Warning
    });

    this.reportIssue(issue);
  }

}

function hasModifier(node: ts.ParameterDeclaration | ts.ClassElement | ts.TypeElement, mod: ts.ModifierFlags): 0 | 1 {
  if (node.modifiers === undefined) return 0;
  return (ts.getCombinedModifierFlags(node) & mod) === mod ? 1 : 0;
}
