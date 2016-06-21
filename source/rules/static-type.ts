"use strict";

import {TemplatingBindingLanguage, InterpolationBindingExpression} from 'aurelia-templating-binding';
import {ViewResources, BindingLanguage, BehaviorInstruction} from 'aurelia-templating';
import {AccessMember, AccessScope, AccessKeyed/*, AccessThis*/, NameExpression} from 'aurelia-binding';
import {Container} from 'aurelia-dependency-injection';
import * as ts from 'typescript';

import {Rule, Parser, ParserState, Issue, IssueSeverity} from 'template-lint';
import {Reflection} from '../reflection';
import {Attribute} from 'parse5';

import 'aurelia-polyfills';

import * as Path from 'path';

import {configure} from 'aurelia-templating-resources';

interface INodeVars {
    name: string,
    type: string
    override?: { any };
}


/**
 *  Rule to ensure static type usage is valid
 */
export class StaticTypeRule extends Rule {
    private expInterp: RegExp = /\${.+}/
    private base: string;

    private state: ParserState;

    private resources: ViewResources;
    private bindingLanguage: TemplatingBindingLanguage;
    private container: Container;

    private viewModelName: string;
    private viewModelFile: string;
    private viewModelSource: ts.SourceFile;
    private viewModelClassDecl: ts.ClassDeclaration;

    constructor(private reflection: Reflection,
        base?: string) {
        super();
        this.base = base || "";

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
            let node = this.state.nextNode;
            let context: INodeVars[] = this.inheritVariables(0);
            let decl = this.inheritDecl();

            node.data.context = context;
            node.data.decl = decl;

            this.examineTag(context, decl, name, attrs, location.line);
        });

        parser.on("text", (text, location) => {
            let stack = this.state.stack;
            let node = stack[stack.length - 1];
            let context: { name: string, type: string }[] = node.data.context;
            let decl = node.data.decl;
            this.examineText(context, decl, text, location.line);
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

    private inheritDecl(): ts.ClassDeclaration {
        let context: INodeVars[] = []
        let stack = this.state.stack;

        for (let i = stack.length - 1; i >= 0; --i) {
            let node = stack[i];
            if (node.data.decl)
                return node.data.decl;
        }

        return this.viewModelClassDecl;
    }

    private examineTag(local: INodeVars[], decl: ts.ClassDeclaration, tag: string, attrs: Attribute[], line: number) {

        let bindingLanguage = this.bindingLanguage;
        let resources = this.resources;

        for (let i = 0, ii = attrs.length; i < ii; ++i) {
            let attr = attrs[i];
            let attrExpStr = attr.name;
            let attrValue = attr.value;
            let info: any = bindingLanguage.inspectAttribute(resources, tag, attrExpStr, attrValue);
            let type = resources.getAttribute(info.attrName);

            if (!info) continue;

            let instruction = bindingLanguage.createAttributeInstruction(resources, <any>{ tagName: tag }, info, undefined);

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
                        let iterator = <string>instruction.attributes['local'];
                        let source = instruction.attributes['items'];
                        let chain = this.flattenAccessChain(source.sourceExpression);
                        let type = this.examineAccessMember(local, decl, chain, line, false);

                        local.push(<INodeVars>{ name: iterator, type: type });

                        break;
                    }
                    case "with": {

                        let source = instruction.attributes['with'];
                        let chain = this.flattenAccessChain(source.sourceExpression);
                        let typedecl = this.examineAccessMember(local, decl, chain, line, true);

                        if (typedecl != null)
                            this.state.nextNode.data.decl = typedecl;

                        break;
                    }
                    default: try {
                        let access = instruction.attributes[attrName].sourceExpression;
                        let chain = this.flattenAccessChain(access);
                        this.examineAccessMember(local, this.viewModelClassDecl, chain, line, false);
                    } catch (ignore) { }
                };
            };
        }
    }

    private examineText(local: INodeVars[], decl: ts.ClassDeclaration, text: string, lineStart: number) {
        let exp = this.bindingLanguage.inspectTextContent(this.resources, text);

        if (!exp)
            return;

        let lineOffset = 0;

        exp.parts.forEach(part => {
            if (part.name !== undefined) {
                let chain = this.flattenAccessChain(part);
                if (chain.length > 0)
                    this.examineAccessMember(local, decl, chain, lineStart + lineOffset, false);
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

    private examineAccessMember(local: { name: string, type: string }[], decl: ts.ClassDeclaration, chain: any[], line: number, returnDecl: boolean): string | ts.ClassDeclaration {
        let name = chain[0].name;
        let type = null;

        let localVar;

        if (local) {
            let localVar = local.find(x => x.name == name);
            if (localVar)
                type = localVar.type;

            if (type == "$element")
                return type;
        }

        if (!type) {
            //find the member;
            let member = decl.members
                .filter(x =>
                    x.kind == ts.SyntaxKind.PropertyDeclaration)
                .find(x => (<any>x.name).text == name);

            if (!member) {
                this.reportAccessMemberIssue(name, decl, line);
                return;
            }

            if ((<any>member).type.typeName != undefined) {
                type = (<any>member).type.typeName.text;
            }
            else if ((<any>member).type.elementType != undefined) {
                type = (<any>member).type.elementType.typeName.text;
            }
        }

        //member exists and access chain continues...
        let typeDecl = this.reflection.getDeclForImportedType(
            (<ts.SourceFile>decl.parent),
            type);

        if (chain.length == 1) {
            if (returnDecl)
                return typeDecl;
            return type;
        }

        if (typeDecl)
            return this.examineAccessMember(null, typeDecl, chain.slice(1), line, returnDecl);

        return null;
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
        this.viewModelName = `${viewName}ViewModel`; // convention for now

        this.viewModelSource = this.reflection.pathToSource[this.viewModelFile];

        if (!this.viewModelSource)
            return;

        let classes = this.viewModelSource.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration);

        this.viewModelClassDecl = <ts.ClassDeclaration>classes.find(x => (<ts.ClassDeclaration>x).name.text == this.viewModelName);
    }

    private capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    private reportAccessMemberIssue(member: string, decl: ts.ClassDeclaration, line: number) {
        let msg = `cannot find '${member}' in type '${decl.name.text}'`;
        let issue = new Issue({
            message: msg,
            line: line,
            column: 0,
            severity: IssueSeverity.Error
        });

        this.reportIssue(issue);
    }
}

