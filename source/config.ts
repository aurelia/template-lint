import {Rule} from 'template-lint';
import {ConflictingAttributesRule} from './conflictingattributes';


export class Config {
    obsoleteTags: Array<{ tag: string, msg: string }> = [
        {
            tag: 'content',
            msg: 'use slot instead'
        }
    ];

    obsoleteAttributes: Array<{ name: string, tag: string, msg: string }> = [
        {
            name: "replaceable",
            tag: "template",
            msg: "'replaceable' on template has been superceded by the slot element"
        }
    ];

    conflictingAttributes: Array<{ tags: string[], msg: string }> = [
        {
            tags: ["repeat.for", "if.bind", "with.bind"],
            msg: "template controllers shouldn't be placed to the same element"
        }
    ];

    voids: Array<string> = ['area', 'base', 'br', 'col', 'embed', 'hr',
        'img', 'input', 'keygen', 'link', 'meta',
        'param', 'source', 'track', 'wbr'];

    scopes: Array<string> = ['html', 'body', 'template', 'svg', 'math'];
    containers: Array<string> = ['table', 'select'];
    customRules: Rule[] = [];
}