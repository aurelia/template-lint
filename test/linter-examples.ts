import { expect } from 'chai';
import { Linter } from '../src/linter';
import { Content, ContentKind } from '../src/content';

export function examples(): void {
  describe("Examples", () => {
    it("should report self-closing element", async () => {

      let html = `
      <template>
        <div/>
      </template>
      `;

      let linter = new Linter();

      let result = await linter.process(Content.fromString(html, ContentKind.Html));
      let issues = result.issues;

      expect(issues.length).equals(1);
      expect(issues[0].message).contains("self-closing");
    });
  });
};
