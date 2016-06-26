"use strict";

import {TemplatingBindingLanguage, InterpolationBindingExpression} from 'aurelia-templating-binding';
import {ViewResources, BindingLanguage, BehaviorInstruction} from 'aurelia-templating';
import {AccessMember, AccessScope, AccessKeyed/*, AccessThis*/, NameExpression, ValueConverter} from 'aurelia-binding';
import {Container} from 'aurelia-dependency-injection';
import * as ts from 'typescript';
import * as Path from 'path';

import {Rule, Parser, ParserState, Issue, IssueSeverity} from 'template-lint';
import {Reflection} from '../reflection';
import {Attribute, StartTagLocationInfo} from 'parse5';

/**
 *  Rule to ensure static type usage is valid
 */
export class StaticTypeRule extends Rule {

    constructor()
    {
        super();
    }

    init(parser:Parser)
    {     
        parser.on("startTag", (tag, attrs, selfClosing, location)=>{

        });

        parser.on("Tag", (tag, attrs, selfClosing, location)=>{

        });
    }

    
}

