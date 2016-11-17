
var Linter = require('./dist/index').Linter;
var Config = require('./dist/index').Config;
var fs = require('fs');

var config = new Config();
config.basepath = "./examples";
config.source = "./**/*.ts";
config.typings = "./**/*.d.ts";

var linter = new Linter();

linter.init()
  .then(() => linter.lint("<template></template>"))
  .then((results) => {
    results.forEach(error => {
      console.log(`${error.message} [ln: ${error.line} col: ${error.column}]`);
      if (error.detail) console.log(`  * ${error.detail}`);
    });
  });
