"use strict";

import {TemplatingBindingLanguage, InterpolationBindingExpression} from 'aurelia-templating-binding';
import {ViewResources, BindingLanguage, BehaviorInstruction} from 'aurelia-templating';
import {AccessMember, AccessScope, AccessKeyed/*, AccessThis*/, NameExpression} from 'aurelia-binding';
import {Container} from 'aurelia-dependency-injection';
import * as ts from 'typescript';
import * as Path from 'path';

import {Rule, Parser, ParserState, Issue, IssueSeverity} from 'template-lint';
import {Reflection} from '../reflection';
import {Attribute} from 'parse5';

import 'aurelia-polyfills';

interface INodeVars {
    name: string,
    type: any,
    override?: { any };
}

/**
 *  Rule to ensure static type usage is valid
 */
export class StaticTypeRule extends Rule {
    private state: ParserState;

    private resources: ViewResources;
    private bindingLanguage: TemplatingBindingLanguage;
    private container: Container;

    private viewModelName: string;
    private viewModelFile: string;
    private viewModelSource: ts.SourceFile;
    private viewModelClassDecl: ts.DeclarationStatement;

    constructor(private reflection: Reflection, public throws?: boolean) {
        super();

        this.container = new Container();
        this.resources = this.container.get(ViewResources);
        this.bindingLanguage = this.container.get(TemplatingBindingLanguage);
    }

    init(parser: Parser, path?: string) {

        this.state = parser.state;

        if (!path || path.trim() == "")
            return;

        this.resolveViewModel(path);

        if (!this.viewModelClassDecl)
            return;

        parser.on("startTag", (name, attrs, selfClosing, location) => {

            if (this.state.nextNode == null)
                return;

            let node = this.state.nextNode;
            let context: INodeVars[] = this.inheritVariables(0);
            let decl = this.inheritDecl();
            let active = this.inheritActive();

            node.data.context = context;
            node.data.decl = decl;
            node.data.active = active;

            if (active) {
                try {
                    this.examineTag(context, decl, name, attrs, location.line);
                } catch (error) {

                    if (this.throws)
                        throw error;

                    node.data.active = false;
                }
            }
        });

        parser.on("text", (text, location) => {

            let stack = this.state.stack;
            if (stack.length == 0)
                return;
            let node = stack[stack.length - 1];
            let context: INodeVars[] = node.data.context;
            let decl = node.data.decl;
            let active = node.data.active;
            if (active) {
                try {
                    this.examineText(context, decl, text, location.line);
                } catch (error) {

                    if (this.throws)
                        throw error;

                    node.data.active = false;
                }
            }
        });
    }

    private inheritVariables(fromDepth: number): Array<INodeVars> {
        let context: INodeVars[] = []
        let stack = this.state.stack;
        for (let i = fromDepth, ii = stack.length; i < ii; ++i) {
            let node = stack[i];
            Object.assign(context, node.data.context);
        }
        return context;
    }

    private inheritActive(): boolean {
        let stack = this.state.stack;
        for (let i = stack.length - 1; i >= 0; --i) {
            let node = stack[i];
            if (node.data.active == false)
                return false;
        }

        return true;
    }

    private inheritDecl(): ts.DeclarationStatement {

        let stack = this.state.stack;

        for (let i = stack.length - 1; i >= 0; --i) {
            let node = stack[i];
            if (node.data.decl)
                return node.data.decl;
        }

        return this.viewModelClassDecl;
    }

    private examineTag(local: INodeVars[], decl: ts.DeclarationStatement, tag: string, attrs: Attribute[], line: number) {

        let bindingLanguage = this.bindingLanguage;
        let resources = this.resources;

        for (let i = 0, ii = attrs.length; i < ii; ++i) {
            let attr = attrs[i];
            let attrExpStr = attr.name;
            let attrValue = attr.value;
            let info: any = bindingLanguage.inspectAttribute(resources, tag, attrExpStr, attrValue);

            if (!info) continue;

            let type = resources.getAttribute(info.attrName);
            let instruction = bindingLanguage.createAttributeInstruction(resources, { tagName: tag }, info, undefined);

            if (!instruction) continue;

            let attrName = instruction.attrName;
            let discrete = instruction.discrete;

            if (discrete) {
                let name = instruction.sourceExpression.name;
                let type = "$$$";
                let override = null; // TODO: typings for HTML Element;
                local.push({ name: name, type: type, override: override });
            }
            else {
                switch (attrName) {
                    case "repeat": {

                        let varKey = <string>instruction.attributes['key'];
                        let varValue = <string>instruction.attributes['value'];
                        let varLocal = <string>instruction.attributes['local'];
                        let source = instruction.attributes['items'];
                        let chain = this.flattenAccessChain(source.sourceExpression);
                        let type = this.resolveAccessChainToType(local, decl, chain, line);

                        if (varKey && varValue) {
                            local.push(<INodeVars>{ name: varKey, type: type });
                            local.push(<INodeVars>{ name: varValue, type: type });
                        }
                        else {
                            local.push(<INodeVars>{ name: varLocal, type: type });
                        }

                        //this needs to override existing context.                        
                        local.push(<INodeVars>{ name: "$index", type: 'number' });
                        local.push(<INodeVars>{ name: "$first", type: 'boolean' });
                        local.push(<INodeVars>{ name: "$last", type: 'boolean' });
                        local.push(<INodeVars>{ name: "$odd", type: 'boolean' });
                        local.push(<INodeVars>{ name: "$even", type: 'boolean' });

                        break;
                    }
                    case "with": {

                        let source = instruction.attributes['with'];
                        let chain = this.flattenAccessChain(source.sourceExpression);
                        let typedecl = this.resolveAccessChainToType(local, decl, chain, line);

                        if (typedecl != null)
                            this.state.nextNode.data.decl = typedecl;

                        break;
                    }
                    default: try {
                        let access = instruction.attributes[attrName].sourceExpression;
                        let chain = this.flattenAccessChain(access);                       

                        this.resolveAccessChainToType(local, decl, chain, line);
                    } catch (error) { if (this.throws) throw error }
                };
            };
        }
    }

    private examineText(local: INodeVars[], decl: ts.DeclarationStatement, text: string, lineStart: number) {
        let exp = this.bindingLanguage.inspectTextContent(this.resources, text);

        if (!exp)
            return;

        let lineOffset = 0;

        exp.parts.forEach(part => {
            if (part.name !== undefined) {
                let chain = this.flattenAccessChain(part);

                if (chain.length > 0)
                    this.resolveAccessChainToType(local, decl, chain, lineStart + lineOffset);
            } else if (part.ancestor !== undefined) {
                //this or ancestor access ($parent)
            }
            else if ((<string>part).match !== undefined) {
                let newLines = (<string>part).match(/\n|\r/);

                if (newLines)
                    lineOffset += newLines.length;
            }
        });
    }

    private resolveAccessChainToType(local: INodeVars[], decl: ts.DeclarationStatement, chain: any[], line: number): string | ts.DeclarationStatement {
        if (chain == null || chain.length == 0)
            return;

        let name = chain[0].name;
        let type = null;

        let localVar;

        if (local) {
            let localVar = local.find(x => x.name == name);

            if (localVar) {
                if (typeof localVar.type === 'string')
                {
                    return type;
                }
                else if (localVar.type.kind !== undefined) {

                if (localVar.type.kind == ts.SyntaxKind.ClassDeclaration)
                    type = (<ts.ClassDeclaration>localVar.type).name.getText();
                }
            }
        }

        if (!type) {
            switch (decl.kind) {
                case ts.SyntaxKind.ClassDeclaration: {

                    let member = (<ts.ClassDeclaration>decl).members
                        .filter(x =>
                            x.kind == ts.SyntaxKind.PropertyDeclaration ||
                            x.kind == ts.SyntaxKind.MethodDeclaration)
                        .find(x => (<any>x.name).text == name);

                    if (!member) {
                        this.reportAccessMemberIssue(name, decl, line);
                        return;
                    }

                    type = this.resolveClassElementType(member);                     
                }
                break;
                case ts.SyntaxKind.InterfaceDeclaration: {

                    let member = (<ts.InterfaceDeclaration>decl).members
                        .filter(x =>
                            x.kind == ts.SyntaxKind.PropertySignature ||
                            x.kind == ts.SyntaxKind.MethodSignature)
                        .find(x => (<any>x.name).text == name);

                    if (!member) {
                        this.reportAccessMemberIssue(name, decl, line);
                        return;
                    }

                    type = this.resolveTypeElementType(member);      
                }
                break;
                default:
                console.log("Unhandled Kind");
                return;                
            }
        }
        
        //member exists and access chain continues...
        let typeDecl = this.reflection.getDeclForImportedType((<ts.SourceFile>decl.parent), type);

        if (chain.length == 1) {
            if (typeDecl)
                return typeDecl;
            return type;
        }
        if (typeDecl)            
            return this.resolveAccessChainToType(null, typeDecl, chain.slice(1), line);
        
        return null;    
    }

    private resolveClassElementType(node: ts.ClassElement): string {
        switch (node.kind) {
            case ts.SyntaxKind.PropertyDeclaration:
                let prop = <ts.PropertyDeclaration>node
                return this.resolveTypeName(prop.type);
            case ts.SyntaxKind.MethodDeclaration:
                let meth = <ts.MethodDeclaration>node
                return this.resolveTypeName(meth.type);
            default:
                console.log(ts.SyntaxKind[node.kind]);
                return null;
        }
    }

    private resolveTypeElementType(node: ts.TypeElement): string {
        switch (node.kind) {
            case ts.SyntaxKind.PropertySignature:
                let prop = <ts.PropertySignature>node
                return this.resolveTypeName(prop.type);
            case ts.SyntaxKind.PropertySignature:
                let meth = <ts.PropertySignature>node
                return this.resolveTypeName(meth.type);
            default:
                console.log(ts.SyntaxKind[node.kind]);
                return null;
        }
    }

    private resolveTypeName(node: ts.TypeNode): string {
        switch (node.kind) {
            case ts.SyntaxKind.ArrayType:
                let arr = <ts.ArrayTypeNode>node;
                return this.resolveTypeName(arr.elementType);
            case ts.SyntaxKind.TypeReference:
                let ref = <ts.TypeReferenceNode>node;
                return ref.typeName.getText();
            case ts.SyntaxKind.StringKeyword:
                return 'string';
            case ts.SyntaxKind.NumberKeyword:
                return 'number';
            case ts.SyntaxKind.BooleanKeyword:
                return 'boolean';
            default:
                console.log("Unable to handle: " + ts.SyntaxKind[node.kind]);
                return null;
        }
    }

    private flattenAccessChain(access) {
        let chain = [];

        while (access !== undefined) {
            chain.push(access);
            access = access.object;
        }

        return chain.reverse();
    }

    private resolveViewModel(path: string) {
        let viewFileInfo = Path.parse(path);
        this.viewModelFile = Path.join(viewFileInfo.dir, `${viewFileInfo.name}.ts`);
        let viewName = this.capitalize(viewFileInfo.name);
        this.viewModelSource = this.reflection.pathToSource[this.viewModelFile];

        if (!this.viewModelSource)
            return;

        let classes = this.viewModelSource.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration);

        this.viewModelName = `${viewName}`; // convention for now
        this.viewModelClassDecl = <ts.ClassDeclaration>classes.find(x => (<ts.ClassDeclaration>x).name.text == this.viewModelName);

        if (this.viewModelClassDecl != null) return;

        this.viewModelName = `${viewName}ViewModel`; // convention for now
        this.viewModelClassDecl = <ts.ClassDeclaration>classes.find(x => (<ts.ClassDeclaration>x).name.text == this.viewModelName);

        if (this.viewModelClassDecl != null) return;

        this.viewModelName = `${viewName}VM`; // convention for now
        this.viewModelClassDecl = <ts.ClassDeclaration>classes.find(x => (<ts.ClassDeclaration>x).name.text == this.viewModelName);
    }

    private toCamel(text) {
        return text.replace(/(\-[a-z])/g, function ($1) { return $1.toUpperCase().replace('-', ''); });
    };

    private capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    private reportAccessMemberIssue(member: string, decl: ts.DeclarationStatement, line: number) {
        let msg = `cannot find '${member}' in type '${decl.name.getText()}'`;
        let issue = new Issue({
            message: msg,
            line: line,
            column: 0,
            severity: IssueSeverity.Error
        });

        this.reportIssue(issue);
    }
}

