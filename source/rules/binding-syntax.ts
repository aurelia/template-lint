"use strict";

import {Rule, Parser, Issue, IssueSeverity} from 'template-lint';
import {Attribute} from 'parse5';

import {TemplatingBindingLanguage, InterpolationBindingExpression} from 'aurelia-templating-binding';
import {ViewResources, BindingLanguage, BehaviorInstruction} from 'aurelia-templating';
import {AccessMember, AccessScope, AccessKeyed/*, AccessThis*/, NameExpression} from 'aurelia-binding';
import {Container} from 'aurelia-dependency-injection';

/**
 * Rule to ensure aurelia is happy with bindings
 */
export class BindingSyntaxRule extends Rule {

    private resources: ViewResources;

    private bindingLanguage: TemplatingBindingLanguage;
    private container: Container;

    constructor() {
        super();
        this.container = new Container();
        this.resources = this.container.get(ViewResources);
        this.bindingLanguage = this.container.get(TemplatingBindingLanguage);
    }

    init(parser: Parser) {
        parser.on("startTag", (name, attrs, selfClosing, location) => {
            this.examineTag(name, attrs, location.line, location.col);
        });
        parser.on("text", (text, location) => {
            this.examineText(text, location.line);
        });
    }

    private examineTag(tag: string, attrs: Attribute[], line: number, col: number) {

        let bindingLanguage = this.bindingLanguage;
        let resources = this.resources;

        for (let i = 0, ii = attrs.length; i < ii; ++i) {
            try {
                let attr = attrs[i];
                let attrExpStr = attr.name;
                let attrValue = attr.value;
                let info: any = bindingLanguage.inspectAttribute(resources, tag, attrExpStr, attrValue);
                let type = resources.getAttribute(info.attrName);

                if (!info) continue;

                let instruction = bindingLanguage.createAttributeInstruction(resources, { tagName: tag }, info, undefined);

            } catch (error) {
                this.reportSyntaxIssue(error, line, col);
            }
        }
    }

    private examineText(text: string, lineStart: number) {
        try {
            let exp = this.bindingLanguage.inspectTextContent(this.resources, text);
        } catch (error) {
            this.reportSyntaxIssue(error, lineStart,0 );
        }
    }

    private reportSyntaxIssue(error: Error, line: number, column: number) {

        let shorter = error.message.split(/\./);

        let msg = shorter ? shorter[0] : error.message.trim();
        let detail = shorter && shorter.length > 1 ? shorter.splice(1).join().trim() : null;

        let issue = new Issue({
            message: msg,
            detail: detail,
            line: line,
            column: column,
            severity: IssueSeverity.Error
        });
        this.reportIssue(issue);
    }
}
