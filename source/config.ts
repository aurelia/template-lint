import {Rule} from 'template-lint';

export class Config {
    
    attributeValueRules: Array<{ attr: RegExp, is?: RegExp, not?: RegExp, msg?: string, tag?:string }> = [
        {
            attr:/^style$/,
            not:/\${(.?)+}/,
            msg:"interpolation not allowed in style attribute"            
        },
        {
            attr:/^bindable$/,
            not:/[a-z][A-Z]/,
            msg:"camelCase bindable is converted to camel-case",
            tag:"template"         
        },     
        {
            tag:"button",
            attr:/^type$/,            
            is:/^button$|^submit$|^reset$|^menu$/,            
            msg:"button type invalid"
        }  
    ]   

    obsoleteTags: Array<{ tag: string, msg?: string }> = [
        {
            tag: 'content',
            msg: 'use slot instead'
        }
    ];

    obsoleteAttributes: Array<{ attr: string, tag?: string, msg?: string }> = [
        {
            attr: "replaceable",
            tag: "template",
            msg: "has been superceded by the slot element"
        }
    ];

    conflictingAttributes: Array<{ attrs: string[], msg?: string }> = [
        {
            attrs: ["repeat.for", "if.bind", "with.bind"],
            msg: "template controllers shouldn't be placed on the same element"
        }
    ];

    templateControllers: string[] = [
        "repeat.for", "if.bind", "with.bind"
    ]

    voids: Array<string> = ['area', 'base', 'br', 'col', 'embed', 'hr',
        'img', 'input', 'keygen', 'link', 'meta',
        'param', 'source', 'track', 'wbr'];

    scopes: Array<string> = ['html', 'body', 'template', 'svg', 'math'];
    containers: Array<string> = ['table', 'select'];
    customRules: Rule[] = [];

    useStaticTyping = false;
    useCustomTypings = false; 
    throwStaticTypingErrors = false;
    errorOnNonPublicAccess = true;
    
    sourceFileGlob = "source/**/*.ts";
    typingsFileGlob = "typings/**/*.d.ts"; 
}