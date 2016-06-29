"use strict";

import 'aurelia-polyfills';

import {TemplatingBindingLanguage, InterpolationBindingExpression} from 'aurelia-templating-binding';
import {ViewResources, BindingLanguage, BehaviorInstruction} from 'aurelia-templating';
import {AccessMember, AccessScope, AccessKeyed/*, AccessThis*/, NameExpression, ValueConverter} from 'aurelia-binding';
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

    constructor(private reflection: Reflection) {
        super();
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
            console.log(error);
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
        for (let i = 0, ii = node.attrs.length; i < ii; ++i) {
            let attr = node.attrs[i];
            this.examineAttribute(node, attr);
        }
    }

    private examineAttribute(node: ASTElementNode, attr: ASTAttribute) {
        let instruction = attr.instruction;
        if (instruction == null)
            return;

        let context = ASTNode.inheritContext(node);
        let locals = ASTNode.inheritLocals(node);

        let attrName = instruction.attrName;
        let attrLoc = attr.location;

        switch (attrName) {
            case "repeat": {

                let varKey = <string>instruction.attributes['key'];
                let varValue = <string>instruction.attributes['value'];
                let varLocal = <string>instruction.attributes['local'];
                let source = instruction.attributes['items'];
                let chain = this.flattenAccessChain(source.sourceExpression);

                let resolved = this.resolveAccessChainToType(context, locals, chain, new FileLoc(attrLoc.line, attrLoc.column));

                if (!resolved)
                    return;

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
                let resolved = this.resolveAccessChainToType(context, locals, chain, new FileLoc(attrLoc.line, attrLoc.column));

                if (resolved != null)
                    node.context = resolved;

                break;
            }
            default: try {
                let access = instruction.attributes[attrName].sourceExpression;
                let chain = this.flattenAccessChain(access);
                let resolved = this.resolveAccessChainToType(context, locals, chain, new FileLoc(attrLoc.line, attrLoc.column));
            } catch (error) { throw error }
        };
    }

    private examineTextNode(node: ASTTextNode) {

        let exp = <any>node.expression;

        if (!exp)
            return;

        let lineOffset = 0;
        let column = node.location.column;
        let context = ASTNode.inheritContext(node);
        let locals = ASTNode.inheritLocals(node);

        exp.parts.forEach(part => {
            if (part.name !== undefined) {
                let chain = this.flattenAccessChain(part);
                if (chain.length > 0)
                    this.resolveAccessChainToType(context, locals, chain, new FileLoc(node.location.line + lineOffset, column));

            } else if (part.ancestor !== undefined) {
                //this or ancestor access ($parent)
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
        let viewModelFile = Path.join(viewFileInfo.dir, `${viewFileInfo.name}.ts`);
        let viewName = this.toSymbol(viewFileInfo.name);

        let viewModelSource = this.reflection.pathToSource[viewModelFile];

        if (!viewModelSource)
            return null;

        let classes = <ts.ClassDeclaration[]>viewModelSource.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration);
        
        if(classes.length > 1)
        {
            this.reportIssue(new Issue({message:"view-model file should only have one class", line:-1, column:-1, severity:IssueSeverity.Warning}))
        }

        let first = classes[0];        
        let context = new ASTContext();

        context.name = first.name.getText();
        context.typeDecl = first;

        return context;
    }

    private resolveAccessChainToType(context: ASTContext, locals: ASTContext[], chain: any[], loc: FileLoc): ASTContext {
        if (chain == null || chain.length == 0)
            return;

        let name = chain[0].name;
        let decl = context.typeDecl;

        let resolved = this.resolveLocalType(locals, name);

        if (!resolved)
            resolved = this.resolveStaticType(context, name);

        if (!resolved) {
            this.reportAccessMemberIssue(name, decl, loc.line, loc.column);
            return null;
        }

        if (chain.length == 1) {
            return resolved;
        }

        return this.resolveAccessChainToType(resolved, null, chain.slice(1), loc);
    }

    private resolveLocalType(locals: ASTContext[], memberName: string): ASTContext {

        if (!locals)
            return null;

        let localVar = locals.find(x => x.name == memberName);

        return localVar;
    }

    private resolveStaticType(context: ASTContext, memberName: string): ASTContext {

        if (context == null || context.typeDecl == null)
            return null;

        let decl = context.typeDecl;
        let resolvedTypeName;

        switch (decl.kind) {
            case ts.SyntaxKind.ClassDeclaration: {
                let member = (<ts.ClassDeclaration>decl).members
                    .filter(x =>
                        x.kind == ts.SyntaxKind.PropertyDeclaration ||
                        x.kind == ts.SyntaxKind.MethodDeclaration)
                    .find(x => (<any>x.name).text == memberName);
                if (!member)
                    break;

                resolvedTypeName = this.reflection.resolveClassElementType(member);
            } break;
            case ts.SyntaxKind.InterfaceDeclaration: {
                let member = (<ts.InterfaceDeclaration>decl).members
                    .filter(x =>
                        x.kind == ts.SyntaxKind.PropertySignature ||
                        x.kind == ts.SyntaxKind.MethodSignature)
                    .find(x => (<any>x.name).text == memberName);
                if (!member)
                    break;

                resolvedTypeName = this.reflection.resolveTypeElementType(member);
            } break;
            default:
                console.log("Unhandled Kind");
                return null;
        }

        if (!resolvedTypeName)
            return null;

        let typeDecl = this.reflection.getDeclForImportedType((<ts.SourceFile>decl.parent), resolvedTypeName);

        //TODO:
        //let typeArgs = <args:ts.TypeReference[]> member.type.typeArguments;
        //The simpler solution here might be to create a copy of the generic type declaration and
        //replace the generic references with the arguments. 

        return new ASTContext({ type: resolvedTypeName, typeDecl: typeDecl });
    }

    private flattenAccessChain(access) {
        let chain = [];

        while (access !== undefined) {
            chain.push(access);
            access = access.object;
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

    private reportAccessMemberIssue(member: string, decl: ts.Declaration, line: number, column: number) {
        let msg = `cannot find '${member}' in type '${decl.name.getText()}'`;
        let issue = new Issue({
            message: msg,
            line: line,
            column: column,
            severity: IssueSeverity.Error
        });

        this.reportIssue(issue);
    }
}

