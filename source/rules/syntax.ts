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
export class SyntaxRule extends ASTBuilder {

    public controllers: string[] = ["repeat.for", "if.bind", "with.bind"];
    public errorOnNonPublicAccess: boolean = true;
    public throwStaticTypingErrors: boolean = false;

    constructor(private reflection: Reflection, opt?: {
        templateControllers?: string[]
        errorOnNonPublicAccess?: boolean,
        throwStaticTypingErrors?: boolean
    }) {
        super();
        if (opt) {
            if (opt.templateControllers) this.controllers = opt.templateControllers;
            if (opt.errorOnNonPublicAccess) this.errorOnNonPublicAccess = opt.errorOnNonPublicAccess;
            if (opt.throwStaticTypingErrors) this.throwStaticTypingErrors = opt.throwStaticTypingErrors;
        }
    }

    init(parser: Parser, path?: string) {
        super.init(parser);
        this.root.context = this.resolveViewModel(path);
    }

    finalise(): Issue[] {
        try {
            if (this.root.context != null)
                this.examineNode(this.root);
        } catch (error) {
            if (this.throwStaticTypingErrors)
                this.reportIssue(new Issue({ message: error, line: -1, column: -1 }));
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
        let attrs = node.attrs.sort(x => (this.controllers.indexOf(x.name) != -1) ? 0 : 1);

        for (let i = 0, ii = attrs.length; i < ii; ++i) {
            let attr = attrs[i];
            this.examineAttribute(node, attr);
        }
    }

    private examineAttribute(node: ASTElementNode, attr: ASTAttribute) {
        let instruction = attr.instruction;

        if (instruction == null)
            return;

        let attrName = instruction.attrName;
        let attrLoc = attr.location;

        switch (attrName) {
            case "repeat": {

                let varKey = <string>instruction.attributes['key'];
                let varValue = <string>instruction.attributes['value'];
                let varLocal = <string>instruction.attributes['local'];
                let source = instruction.attributes['items'];
                let chain = this.flattenAccessChain(source.sourceExpression);
                let resolved = this.resolveAccessScopeToType(node, chain, new FileLoc(attrLoc.line, attrLoc.column));

                if (varKey && varValue) {
                    node.locals.push(new ASTContext({ name: varKey, type: 'string' }));
                    node.locals.push(new ASTContext({ name: varValue, type: resolved.type, typeDecl: resolved.typeDecl }));
                }
                else {
                    node.locals.push(new ASTContext({ name: varLocal, type: resolved.type, typeDecl: resolved.typeDecl }));
                }

                node.locals.push(new ASTContext({ name: "$index", type: 'number' }));
                node.locals.push(new ASTContext({ name: "$first", type: 'boolean' }));
                node.locals.push(new ASTContext({ name: "$last", type: 'boolean' }));
                node.locals.push(new ASTContext({ name: "$odd", type: 'boolean' }));
                node.locals.push(new ASTContext({ name: "$even", type: 'boolean' }));

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

        if (resolved === undefined){
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
        let resolvedTypeName;
        let member = null;

        switch (decl.kind) {
            case ts.SyntaxKind.ClassDeclaration: {
                member = (<ts.ClassDeclaration>decl).members
                    .filter(x =>
                        x.kind == ts.SyntaxKind.PropertyDeclaration ||
                        x.kind == ts.SyntaxKind.MethodDeclaration ||
                        x.kind == ts.SyntaxKind.GetAccessor)
                    .find(x => (<any>x.name).text == memberName);
                if (!member)
                    break;

                resolvedTypeName = this.reflection.resolveClassElementType(member);
            } break;
            case ts.SyntaxKind.InterfaceDeclaration: {
                member = (<ts.InterfaceDeclaration>decl).members
                    .filter(x =>
                        x.kind == ts.SyntaxKind.PropertySignature ||
                        x.kind == ts.SyntaxKind.MethodSignature ||
                        x.kind == ts.SyntaxKind.GetAccessor)
                    .find(x => (<any>x.name).text == memberName);
                if (!member)
                    break;

                resolvedTypeName = this.reflection.resolveTypeElementType(member);
            } break;
            default:
            //console.log("Unhandled Kind");
        }

        if (!member) {
            this.reportUnresolvedAccessMemberIssue(memberName, decl, loc);
            return null;
        }

        if (!resolvedTypeName)
            return null;

        if ((this.errorOnNonPublicAccess) && (
            member.flags & ts.NodeFlags.Private ||
            member.flags & ts.NodeFlags.Protected)) {
            this.reportPrivateAccessMemberIssue(memberName, decl, loc);
            return null;
        }

        let typeDecl = this.reflection.getDeclForImportedType((<ts.SourceFile>decl.parent), resolvedTypeName);
        let memberIsArray = member.type.kind == ts.SyntaxKind.ArrayType;

        //TODO:
        //let typeArgs = <args:ts.TypeReference[]> member.type.typeArguments;
        //The simpler solution here might be to create a copy of the generic type declaration and
        //replace the generic references with the arguments. 

        return new ASTContext({ type: resolvedTypeName, typeDecl: typeDecl, isArray: memberIsArray, typeValue: memberIsArray ? [] : null });
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

    private reportPrivateAccessMemberIssue(member: string, decl: ts.Declaration, loc: FileLoc) {
        let msg = `field '${member}' in type '${decl.name.getText()}' is private`;
        let issue = new Issue({
            message: msg,
            line: loc.line,
            column: loc.column,
            severity: IssueSeverity.Error
        });

        this.reportIssue(issue);
    }
}

