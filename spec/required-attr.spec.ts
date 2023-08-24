
import { Linter, Rule } from 'template-lint';
import { RequiredAttributeRule } from '../source/rules/required-attr';

describe("Required Attribute Rule", () => {
  var linter: Linter = new Linter([
    new RequiredAttributeRule([
      { tag: /^button$/, attr: /^type$/, msg: "buttons must have a type attribute" }
    ])
  ]);

  it("should complain when tag with missing attribute ", async () => {
    try {
      let issues = await linter.lint('<template><button></button></template>');
      expect(issues.length).toBe(1);
      expect(issues[0].message).toBe("buttons must have a type attribute");
    } catch (err) {
      fail(err);
    }
  });

  it("should not complain for tags without rules", async () => {
    try {
      let issues = await linter.lint('<template><div></div></template>');
      expect(issues.length).toBe(0);
    } catch (err) {
      fail(err);
    }
  });
});
