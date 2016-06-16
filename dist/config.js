"use strict";
class Config {
    constructor() {
        this.attributeValueRules = [
            {
                attr: /^style$/,
                not: /\${(.?)+}/,
                msg: "interpolation not allowed for attribute"
            }
        ];
        this.obsoleteTags = [
            {
                tag: 'content',
                msg: 'use slot instead'
            }
        ];
        this.obsoleteAttributes = [
            {
                attr: "replaceable",
                tag: "template",
                msg: "has been superceded by the slot element"
            }
        ];
        this.conflictingAttributes = [
            {
                attrs: ["repeat.for", "if.bind", "with.bind"],
                msg: "template controllers shouldn't be placed on the same element"
            }
        ];
        this.voids = ['area', 'base', 'br', 'col', 'embed', 'hr',
            'img', 'input', 'keygen', 'link', 'meta',
            'param', 'source', 'track', 'wbr'];
        this.scopes = ['html', 'body', 'template', 'svg', 'math'];
        this.containers = ['table', 'select'];
        this.customRules = [];
    }
}
exports.Config = Config;

//# sourceMappingURL=config.js.map
