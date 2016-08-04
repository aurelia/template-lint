
var AureliaLinter = require('./dist/aurelia-linter').AureliaLinter;
var Config = require('./dist/config').Config;
var fs = require('fs');

var config = new Config();

config.useRuleAureliaBindingAccess = true;

config.reflectionOpts.sourceFileGlob = "example/**/*.ts";
config.reflectionOpts.typingsFileGlob = "typings/my-lib.d.ts"

var linter = new AureliaLinter(config);

var htmlpath = "./example/foo.html";
var html = fs.readFileSync(htmlpath, 'utf8');

linter.lint(html, htmlpath)
  .then((results) => {
    results.forEach(error => {
      console.log(`${error.message} [ln: ${error.line} col: ${error.column}]`);
      if (error.detail) console.log(`  * ${error.detail}`);
    });
  });
