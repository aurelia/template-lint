
"use strict";

import {Rule, Parser, Issue, IssueSeverity} from 'template-lint';
import {Attribute, StartTagLocationInfo} from 'parse5';

/**
 *  Rule to ensure root element is the template element
 */
export class SlotRule extends Rule {
    controllers:string[];
    slots: Array<{ name: string, loc: StartTagLocationInfo }>;

    constructor(controllers?:string[]) {        
        super();
        this.slots = new Array<{ name: string, loc: StartTagLocationInfo }>();
        this.controllers = controllers || ["repeat.for", "if.bind", "with.bind"];
    }

    init(parser: Parser) {
        var stack = parser.state.stack

        parser.on("startTag", (tag, attrs, sc, loc) => {
            if (tag == 'slot') {
                var name = "";
                var nameIndex = attrs.findIndex((a) => a.name == "name");

                if (nameIndex >= 0)
                    name = attrs[nameIndex].value;

                this.slots.push({ name: name, loc: loc });

                for (let i = stack.length - 1; i >= 0; i--) {
                    let result = stack[i].attrs.find(x => this.controllers.indexOf(x.name)!= -1)
                    if (result){
                        this.reportIssue(
                            new Issue({
                                message: `slot cannot have ancestor using ${result.name}`,
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



