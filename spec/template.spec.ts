
import { Linter, Rule } from 'template-lint';
import { TemplateRule } from '../source/rules/template';

describe("Template Rule", () => {

    var linter: Linter = new Linter([
        new TemplateRule()
    ]);

    it("will accept template root element", (done) => {
        linter.lint('<template></template>')
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("will reject non-template root element", (done) => {
        linter.lint('<temslat></temslat>')
            .then((issues) => {
                expect(issues[0].message).toBe('root element is not template');
                done();
            });
    });

    it("will ignore html non-template root element", (done) => {

        linter.lint('<!DOCTYPE html><html><body><temslat></temslat></body></html>')
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("will ignore nested template", (done) => {

        linter.lint('<template><template></template></template>')
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });

    it("will reject template directly under table ", (done) => {
        linter.lint('<template><table><template><template><table></template>')
            .then((issues) => {
                expect(issues[0].message).toBe("template as child of <table> not allowed");
                done();
            });
    });

    it("will reject template directly under select", (done) => {
        linter.lint('<template><select><template></template></select></template>')
            .then((issues) => {
                expect(issues[0].message).toBe("template as child of <select> not allowed");
                done();
            });
    });


    it("will pass template with valid contents", (done) => {
        linter.lint('<template><button></button><div></div></template>')
            .then((issues) => {
                expect(issues.length).toBe(0);
                done();
            });
    });
});