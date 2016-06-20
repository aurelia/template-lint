
var AureliaLinter = require('./dist/aurelia-linter').AureliaLinter;
var Config = require('./dist/config').Config;
var fs = require('fs');

var config = new Config();

config.useStaticTyping = true;

var linter = new AureliaLinter(config);

var htmlpath = "./example/foo.html";
var html = fs.readFileSync(htmlpath, 'utf8');

linter.initialise("example/**/*.ts")
  .then(() => {
    linter.lint(html, htmlpath).then((results) => {
      console.log(results);
    });
  });