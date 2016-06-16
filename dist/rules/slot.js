"use strict";
const template_lint_1 = require('template-lint');
/**
 *  Rule to ensure root element is the template element
 */
class SlotRule extends template_lint_1.Rule {
    constructor() {
        super();
        this.slots = new Array();
    }
    init(parser, parseState) {
        var self = this;
        var stack = parseState.stack;
        parser.on("startTag", (tag, attrs, sc, loc) => {
            if (tag == 'slot') {
                var name = "";
                var nameIndex = attrs.findIndex((a) => a.name == "name");
                if (nameIndex >= 0)
                    name = attrs[nameIndex].value;
                self.slots.push({ name: name, loc: loc });
            }
        });
    }
    finalise() {
        var slots = this.slots;
        var names = new Array();
        for (var i = 0; i < slots.length; i++) {
            var slot = slots[i];
            if (names.indexOf(slot.name) !== -1) {
                let errorStr = null;
                if (slot.name === "") {
                    errorStr = "more than one default slot detected";
                }
                else {
                    errorStr = `duplicated slot name \(${slot.name}\)`;
                }
                let error = new template_lint_1.Issue({
                    message: errorStr,
                    line: slot.loc.line,
                    column: slot.loc.col });
                this.reportIssue(error);
            }
            else {
                names.push(slot.name);
            }
        }
        this.slots = []; // reset
        return super.finalise();
    }
}
exports.SlotRule = SlotRule;

//# sourceMappingURL=slot.js.map
