
"use strict";

import {Rule, ParseState, Issue, IssueSeverity} from 'template-lint';
import {SAXParser, Attribute, StartTagLocationInfo} from 'parse5';

/**
 *  Rule to ensure root element is the template element
 */
export class SlotRule extends Rule {

    slots: Array<{ name: string, loc: StartTagLocationInfo }>;

    constructor() {
        super();
        this.slots = new Array<{ name: string, loc: StartTagLocationInfo }>();
    }

    init(parser: SAXParser, parseState: ParseState) {
        var stack = parseState.stack;

        parser.on("startTag", (tag, attrs, sc, loc) => {
            if (tag == 'slot') {
                var name = "";
                var nameIndex = attrs.findIndex((a) => a.name == "name");

                if (nameIndex >= 0)
                    name = attrs[nameIndex].value;

                this.slots.push({ name: name, loc: loc });

                for (let i = stack.length - 1; i >= 0; i--) {
                    if (stack[i].attrs.find(x => x.name == "if.bind")) {
                        this.reportIssue(
                            new Issue({
                                message: "slot has ancestor with if.bind",
                                line: loc.line,
                                column: loc.col
                            }));
                        return;
                    }
                }
            }
        })
    }

    finalise(): Issue[] {
        var slots = this.slots;

        var names = new Array<string>();

        for (var i = 0; i < slots.length; i++) {
            var slot = slots[i];

            if (names.indexOf(slot.name) !== -1) {
                let errorStr = null;

                if (slot.name === "") {
                    errorStr = "more than one default slot detected";
                } else {
                    errorStr = `duplicated slot name \(${slot.name}\)`;
                }

                let error = new Issue({
                    message: errorStr,
                    line: slot.loc.line,
                    column: slot.loc.col
                });

                this.reportIssue(error)
            }
            else {
                names.push(slot.name);
            }
        }

        this.slots = []; // reset

        return super.finalise();
    }
}



