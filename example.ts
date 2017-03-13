import { Linter, Content, ContentKind } from "./src/index";

async function main(): Promise<void> {

  let html = `
      <template>
        <div/>
      </template>
      `;

  let linter = new Linter();

  let result = await linter.process(Content.fromString(html, ContentKind.Html));

  console.log(result);
}

main();
