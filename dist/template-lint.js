"use strict";
const parse5_1 = require('parse5');
const stream_1 = require('stream');
class TemplateLint {
    constructor() {
    }
    hasSelfCloseTags(template) {
        var parser = new parse5_1.SAXParser();
        var stream = new stream_1.Readable();
        stream.push(template);
        stream.push(null);
        var parser = new parse5_1.SAXParser();
        var hasSelfClose = false;
        parser.on('startTag', (name, attrs, selfClosing, location) => {
            hasSelfClose = hasSelfClose || selfClosing;
        });
        var work = stream.pipe(parser);
        return new Promise(function (resolve, reject) {
            work.on("end", () => { resolve(hasSelfClose); });
        });
    }
}
exports.TemplateLint = TemplateLint;
