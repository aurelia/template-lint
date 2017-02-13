const {Linter, Content, ContentKind} = require('./src/index.ts');

let html = `
      <template>
        <div/>
      </template>
      `;

let linter = new Linter();

linter.process(Content.fromString(html, ContentKind.Html))
  .then((r) => {
    let issues = r.issues;
  });

