"use strict";

import 'aurelia-polyfills';

import {TemplatingBindingLanguage, /*InterpolationBindingExpression*/} from 'aurelia-templating-binding';
import {ViewResources, BindingLanguage, BehaviorInstruction} from 'aurelia-templating';
import {AccessMember, AccessScope, AccessKeyed, Expression, NameExpression, ValueConverter} from 'aurelia-binding';
import {Container} from 'aurelia-dependency-injection';
import * as ts from 'typescript';
import * as Path from 'path';

import {Rule, Parser, ParserState, Issue, IssueSeverity} from 'template-lint';
import {Reflection} from '../reflection';

import {
    ASTBuilder,
    ASTElementNode,
    ASTTextNode,
    ASTNode,
    ASTAttribute,
    ASTContext,
    FileLoc} from '../ast';

/**
 *  Rule to ensure static type usage is valid
 */
export class BindingRule extends ASTBuilder {
    public reportBindingAccess = true;
    public reportExceptions = false;

    public localProvidors = ["repeat.for", "if.bind", "with.bind"]
    public restrictedAccess = ["private", "protected"]

    constructor(
        private reflection: Reflection,
        opt?: {
            reportBindingSyntax?: boolean,
            reportBindingAccess?: boolean,
            reportExceptions?: boolean,
            localProvidors?: string[],
            restrictedAccess?: string[]
        }) {
        super();

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

        if (node instanceof ASTElementNode)
            this.examineElementNode(node);
        else if (node instanceof ASTTextNode)
            this.examineTextNode(node);

        if (node.children == null)
            return;

        node.children.forEach(child => {
            this.examineNode(child);
        });
    }

    private examineElementNode(node: ASTElementNode) {
        let attrs = node.attrs.sort(x => (this.localProvidors.indexOf(x.name) != -1) ? 0 : 1);

        for (let i = 0, ii = attrs.length; i < ii; ++i) {
            let attr = attrs[i];
            this.examineAttribute(node, attr);
        }
    }

    private examineAttribute(node: ASTElementNode, attr: ASTAttribute) {
        let instruction = attr.instruction;

        if (instruction == null)
            return;

        let instructionName = instruction.constructor.name;

        switch (instructionName) {
            case "BehaviorInstruction": {
                let attrName = instruction.attrName;
                this.examineBehaviorInstruction(node, <BehaviorInstruction>instruction, attrName, attr.location)
                break;
            }
            case "ListernerExpression": {

                break;
            }
            default: {
                if (this.reportExceptions)
                    this.reportIssue(new Issue({ message: `Unknown instruction type: ${instructionName}`, line: attr.location.line }));
            }
        }
    }

    private examineBehaviorInstruction(node: ASTElementNode, instruction: BehaviorInstruction, attrName: string, attrLoc: FileLoc) {
        switch (attrName) {
            case "repeat": {

                let varKey = <string>instruction.attributes['key'];
                let varValue = <string>instruction.attributes['value'];
                let varLocal = <string>instruction.attributes['local'];
                let source = instruction.attributes['items'];
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

                let source = instruction.attributes['with'];
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

    private examineTextNode(node: ASTTextNode) {
        let exp = <any>node.expression;

        if (!exp)
            return;

        if (exp.constructor.name == "InterpolationBindingExpression")
            this.examineInterpolationExpression(node, exp);
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

    private resolveViewModel(path: string): ASTContext {
        if (!path || path.trim() == "")
            return null;

        let viewFileInfo = Path.parse(path);
        let viewModelFile = Path.join(viewFileInfo.dir, `${viewFileInfo.name}`);
        let viewName = this.toSymbol(viewFileInfo.name);

        let viewModelSource = this.reflection.pathToSource[viewModelFile];

        if (!viewModelSource)
            return null;

        let classes = <ts.ClassDeclaration[]>viewModelSource.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration);

        /*if(classes.length > 1) // http://stackoverflow.com/questions/29101883/aurelia-view-model-class-naming
        {
            this.reportIssue(new Issue({message:"view-model file should only have one class", line:-1, column:-1, severity:IssueSeverity.Warning}))
        }*/

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
                    resolved = this.resolveStaticType(context, name, loc);
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

    private resolveStaticType(context: ASTContext, memberName: string, loc: FileLoc): ASTContext {

        if (context == null || context.typeDecl == null)
            return null;

        let decl = context.typeDecl;
        let memberType: ts.TypeNode;
        let member = null;

        switch (decl.kind) {
            case ts.SyntaxKind.ClassDeclaration: {
                const classDecl = <ts.ClassDeclaration>decl;

                let members = this.resolveClassMembers(classDecl);

                member = members
                    .filter(x =>
                        x.kind == ts.SyntaxKind.PropertyDeclaration ||
                        x.kind == ts.SyntaxKind.MethodDeclaration ||
                        x.kind == ts.SyntaxKind.GetAccessor)
                    .find(x => (<any>x.name).text == memberName);

                if (member) {
                    memberType = this.reflection.resolveClassElementType(member);
                } else {
                    const constr = <ts.ConstructorDeclaration>members.find(ce => ce.kind == ts.SyntaxKind.Constructor);
                    if (constr) {
                        const param: ts.ParameterDeclaration = constr.parameters.find(parameter => parameter.name.getText() === memberName);
                        if (param && param.flags) {
                            // Constructor parameters that have public/protected/private modifier, are class members.
                            // Looks like there is no need to inspect `param.modifiers`, because
                            // 1) access restriction is checked bellow
                            // 2) to my understanding, access modifiers are the only flags that can be used on constructor parameters
                            member = param;
                            memberType = param.type;
                        }
                    }
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
            const isPrivate = member.flags & ts.NodeFlags.Private;
            const isProtected = member.flags & ts.NodeFlags.Protected;

            if (isPrivate | isProtected) {

                const reportPrivate = this.restrictedAccess.indexOf("private") != -1;
                const reportProtected = this.restrictedAccess.indexOf("protected") != -1;

                if (isPrivate && reportPrivate || isProtected && reportProtected) {
                    const accessModifier = isPrivate ? "private" : "protected";
                    this.reportPrivateAccessMemberIssue(memberName, decl, loc, accessModifier);

                } return null;
            }
        }
        let memberTypeName = this.reflection.resolveTypeName(memberType);
        let memberTypeDecl: ts.Declaration = this.reflection.getDeclForType((<ts.SourceFile>decl.parent), memberTypeName);
        let memberIsArray = member.type.kind == ts.SyntaxKind.ArrayType;

        //TODO:
        //let typeArgs = <args:ts.TypeReference[]> member.type.typeArguments;
        //The simpler solution here might be to create a copy of the generic type declaration and
        //replace the generic references with the arguments.

        return new ASTContext({ type: memberType, typeDecl: memberTypeDecl, typeValue: memberIsArray ? [] : null });
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
                    members = <ts.NodeArray<ts.ClassElement>>members.concat(baseMembers);
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
                    members = <ts.NodeArray<ts.TypeElement>>members.concat(baseMembers);
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
        return value.replace(/([a-z][A-Z])/g, function (g) { return g[0] + '-' + g[1].toLowerCase() });
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

    private reportUnresolvedAccessMemberIssue(member: string, decl: ts.Declaration, loc: FileLoc) {
        let msg = `cannot find '${member}' in type '${decl.name.getText()}'`;
        let issue = new Issue({
            message: msg,
            line: loc.line,
            column: loc.column,
            severity: IssueSeverity.Error
        });

        this.reportIssue(issue);
    }

    private reportPrivateAccessMemberIssue(member: string, decl: ts.Declaration, loc: FileLoc, accessModifier: string) {
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
