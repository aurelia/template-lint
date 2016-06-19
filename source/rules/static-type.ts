"use strict";

import 'aurelia-polyfills';

import {Rule, Parser, Issue, IssueSeverity} from 'template-lint';
import {Attribute} from 'parse5';
import {Reflection} from '../reflection';

import {ViewResources} from 'aurelia-templating';
import {TemplatingBindingLanguage} from 'aurelia-templating-binding';
import {BindingLanguage, BehaviorInstruction} from 'aurelia-templating';
import {Container} from 'aurelia-dependency-injection';



/**
 *  Rule to ensure static type usage is valid
 */
export class StaticTypeRule extends Rule {
    private expInterp: RegExp = /\${.+}/
    private base: string;

    private resources:ViewResources;
    private bindingLanguage:TemplatingBindingLanguage;
    private container:Container;

    constructor(private reflection: Reflection,
        base?: string) {
        super();
        this.base = base || "";

        this.container = new Container();
        this.resources = this.container.get(ViewResources);
        this.bindingLanguage = this.container.get(TemplatingBindingLanguage);
    }

    init(parser: Parser, path?: string) {
        parser.on("startTag", (name, attrs, selfClosing, location) => {
            let resources = this.resources;
            let bindingLanguage = resources.getBindingLanguage(this.bindingLanguage);

            for (let i = 0, ii = attrs.length; i < ii; ++i) {
                let attr = attrs[i];
                let attrName = attr.name;
                let attrValue = attr.value;
                let info: any = bindingLanguage.inspectAttribute(resources, name, attrName, attrValue);
                let type = resources.getAttribute(info.attrName);

                let instruction = bindingLanguage.createAttributeInstruction(
                    resources, <any>{ tagName: name }, info, undefined);

                console.log(info);
                console.log(type);
                console.log(instruction);
                console.log((<any>instruction).attributes.value);
            }


        });

        parser.on("text", (text, location) => {
            var interps = text.match(this.expInterp);
            if (interps) {
                interps.forEach(element => {
                    let binding = element.slice(2, element.length - 1);
                    console.log(binding + " in " + path);
                });
            }
        });
    }
}

