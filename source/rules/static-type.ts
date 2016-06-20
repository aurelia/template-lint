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
    private viewModelClass: ts.ClassDeclaration;

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

        if (!this.viewModelClass)
            return;

        parser.on("startTag", (name, attrs, selfClosing, location) => {
            let node = this.state.nextNode;
            let context:{ name: string, type: string}[] = new Array<{ name: string, type: string}>();

            node.data.context = context;

            this.examineTag(context, name, attrs, location.line);
        });

        parser.on("text", (text, location) => {
            let stack = this.state.stack;
            let node = stack[stack.length-1];
            let context:{ name: string, type: string}[] = node.data.context;
            this.examineText(context, text, location.line);
        });
    }

    private examineTag(local:{ name: string, type: string}[], tag: string, attrs: Attribute[], line: number) {

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

            if(instruction instanceof NameExpression)

            let attrName = instruction.attrName;

            console.log(instruction);


            switch (attrName) {
                case "repeat": {
                    let iterator = <string>instruction.attributes['local'];
                    let source = instruction.attributes['items'];
                    let chain = this.flattenAccessChain(source.sourceExpression);
                    let type = this.examineAccessMember(local, this.viewModelClass, chain, line);

                    local.push({ name: iterator, type: type });

                    break;
                }
                case "with": {
                    //console.log(instruction);
                    break;
                }
                case "ref": {
                    console.log(instruction);
                    break;
                }
                default: try {
                    let access = instruction.attributes[attrName].sourceExpression;
                    let chain = this.flattenAccessChain(access);                    
                    this.examineAccessMember(local, this.viewModelClass, chain, line);
                } catch (ignore) { }
            };
        }
    }

    private examineText(local:{ name: string, type:string}[], text: string, lineStart: number) {
        let exp = this.bindingLanguage.inspectTextContent(this.resources, text);

        if (!exp)
            return;

        let lineOffset = 0;

        exp.parts.forEach(part => {
            if (part.name !== undefined) {
                let chain = this.flattenAccessChain(part);
                if (chain.length > 0)
                    this.examineAccessMember(local, this.viewModelClass, chain, lineStart + lineOffset);
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

    private examineAccessMember(local: { name: string, type: string }[], decl: ts.ClassDeclaration, chain: any[], line: number): string {
        let name = chain[0].name;
        let type = null;

        let localVar = local.find(x => x.name == name);

        if (localVar)
            type = localVar.type;

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

        if (chain.length == 1)
            return type;

        //member exists and access chain continues...
        let typeDecl = this.reflection.getDeclForImportedType(
            (<ts.SourceFile>decl.parent),
            type);

        if (typeDecl)
            return this.examineAccessMember(local, typeDecl, chain.slice(1), line);


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

        this.viewModelClass = <ts.ClassDeclaration>classes.find(x => (<ts.ClassDeclaration>x).name.text == this.viewModelName);
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

