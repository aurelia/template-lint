"use strict";

import {Rule, Parser, Issue, IssueSeverity} from 'template-lint';

/**
 * /// OBSOLETE /// Rule to ensure tags are properly closed. 
 */
export class RepeatForRule extends Rule {

    init(parser: Parser) {

        var syntax: RegExp = /(.+)( +of +)(.+)/

        parser.on("startTag", (tag, attrs, selfClosing, loc) => {

            var self = this;

            attrs.forEach(attr => {
                if (attr.name == "repeat") {
                    let issue = new Issue({
                        message: "did you miss `.for` on repeat?", 
                        line: loc.line, 
                        column: loc.col});

                    self.reportIssue(issue);
                    return;
                }
                if (attr.name == "repeat.for") {
                    var script = attr.value.trim();

                    var matches = script.match(syntax);

                    var error = null;

                    if (matches == null || matches.length == 0) {
                        let error = new Issue({
                            message: "repeat syntax should be of form `* of *`",
                            line: loc.line,
                            column: loc.col});
                        self.reportIssue(error);
                    }
                }
            });
        });
    }
}