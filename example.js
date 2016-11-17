
var Linter = require('./dist/index').Linter;
var fs = require('fs');

var linter = new Linter();

/*var htmlpath = "./example/foo.html";
var html = fs.readFileSync(htmlpath, 'utf8');

linter.lint(html, htmlpath)
  .then((results) => {
    results.forEach(error => {
      console.log(`${error.message} [ln: ${error.line} col: ${error.column}]`);
      if (error.detail) console.log(`  * ${error.detail}`);
    });
  });*/
