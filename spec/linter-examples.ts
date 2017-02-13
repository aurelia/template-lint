import { expect, assert } from 'chai';

import { Linter } from '../src/linter';
import { Content, ContentKind } from '../src/content';

export function examples() {
  describe("Examples", () => {
    it("process content from string", async () => {

      let html = `
      <template>
        <div/>
      </template>
      `;

      let linter = new Linter();

      let result = await linter.process(Content.fromString(html, ContentKind.Html));
      let issues = result.issues;

      expect(issues.length).equals(1);
    });
  });
};
