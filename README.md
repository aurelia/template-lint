# aurelia-template-lint

![logo](https://d30y9cdsu7xlg0.cloudfront.net/png/30843-200.png)

Sanity check of Aurelia-flavor Template HTML.

[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-downloads]][npm-url]
[![Travis Status][travis-image]][travis-url]
[![Breaks-on][breaks-image]][npm-url]
[![Stability][stability-image]][npm-url]
[![Gitter][gitter-image]][gitter-url]

##Info
This project was the result of wondering why aurelia applications had missing content when you used self-closing tags.
In the end it turns out that if your template html is ill-formed, the browser's parser will not complain and you will simply have missing content
and/or an ill formed DOM element tree.

By using this lint during your development cycle, you can spot problems with your html and/or templates before they cause problems in the browser.
aurelia-template-lint extends upon [template-lint](https://github.com/MeirionHughes/template-lint/) (the base lint project) to add aurelia-specific rules
and easier configuration of them.

See:
* [StackOverflow: aurelia-self-closing-require-element-does-not-work](http://stackoverflow.com/questions/37300986/aurelia-self-closing-require-element-does-not-work)
* [StackOverflow: aurelia-sanity-check-template-html](http://stackoverflow.com/questions/37322985/aurelia-sanity-check-template-html)

*Note: it is recommended you use this via the [gulp plugin](https://github.com/MeirionHughes/gulp-aurelia-template-lint).*
*If you use this library directly, in a production environment (ci), then ensure you lock to a minor version as this library is under development and subject to breaking changes on minor versions*

##Example
using the default config, the example:

```html
 1:<template>
 2:    <require/>
 3:    <require frm="bad"/> 
 4:
 5:    <div repeat="item of items"></div>
 6:    <div repeat.for="item of"></div>
 7:
 8:    <content></content>
 9:
10:    <slot></slot>
11:    <slot></slot>    
12:       
13:    <table>
14:        <template></template>     
15:    </table>
16:    <div repeat.for="user of users" with.bind="user"></div>
17:</etemps> <!-- oops! -->
```

will result in the following errors:

```
suspected unclosed element detected [ln: 1 col: 1]
self-closing element [ln: 2 col: 5]
require tag is missing a 'from' attribute [ln: 2 col: 5]
require tag is missing a 'from' attribute [ln: 3 col: 5]
self-closing element [ln: 3 col: 5]
did you miss `.for` on repeat? [ln: 5 col: 5]
repeat syntax should be of form `* of *` [ln: 6 col: 5]
<content> is obsolete [ln: 8 col: 5]
  * use slot instead
more than one default slot detected [ln: 11 col: 5]
template as child of <table> not allowed [ln: 14 col: 9]
conflicting attributes: [repeat.for, with.bind] [ln: 16 col: 5]
  * template controllers shouldn't be placed on the same element
mismatched close tag [ln: 17 col: 1]
```
## Rules
Rules used by default:

* **SelfClose**
  * *ensure non-void elements do not self-close*
* **Parser**
  * *returns detected unclosed/ill-matched elements errors captured during parsing*
* **ObsoleteTag**
  * *identify obsolete tag usage*
* **ObsoleteAttributes**
  * *identify obsolete attribute usage*
* **Slot**
  * *don't allow two, or more, slots to have the same name;*
  * *don't allow more than one default slot;*  
* **Require**
  * *ensure require elments have a 'from' attribute*
* **RepeatFor**
  * *ensure loop is well formed*
* **ConflictingAttributesRule**
  * *ensure element doesn't have attribute combination marked as conflicting.* 
  * *i.e. template controller attributes (`if.bind` and `repeat.for` on the same element)*
* **Template**
  * *ensure root is a template element, unless its <html>*
  * *no more than one template element present*

I'm more than happy to add or improve rules;
so please feel free to [create an issue](https://github.com/MeirionHughes/aurelia-template-lint/labels/rule),
or even a pull request.

## Install
```
npm install aurelia-template-lint
```

##Usage
*For use with gulp, there is a [gulp plugin available](https://github.com/MeirionHughes/gulp-aurelia-template-lint)*


```
const AureliaLinter = require('aurelia-template-lint').AureliaLinter

var linter = new AureliaLinter();

var html = "<template></template>"

linter.lint(html)
  .then((errors) => {    
      errors = errors.sort((a,b)=> a.line - b.line);          
      errors.forEach(error => {         
         console.log(`${error.message} [ln: ${error.line} col: ${error.column}]`);
             if(error.detail) console.log(`  * ${error.detail}`);
      });
  });
```

can be configured by passing a config object

```
const Config = require('aurelia-template-lint').Config

var config = new Config();

config.obsoleteTags.push({tag:'my-old-tag', msg:'is really old'});

var linter = new AureliaLinter(config);
```

Config is an object type of the form and default:

```
class Config {
    obsoleteTags: Array<{ tag: string, msg?: string }> = [
        {
            tag: 'content',
            msg: 'use slot instead'
        }
    ];

    obsoleteAttributes: Array<{ attr: string, tag?: string, msg?: string }> = [
        {
            attr: "replaceable",
            tag: "template",
            msg: "has been superceded by the slot element"
        }
    ];

    conflictingAttributes: Array<{ attrs: string[], msg?: string }> = [
        {
            attrs: ["repeat.for", "if.bind", "with.bind"],
            msg: "template controllers shouldn't be placed on the same element"
        }
    ];

    voids: Array<string> = ['area', 'base', 'br', 'col', 'embed', 'hr',
        'img', 'input', 'keygen', 'link', 'meta',
        'param', 'source', 'track', 'wbr'];

    scopes: Array<string> = ['html', 'body', 'template', 'svg', 'math'];
    containers: Array<string> = ['table', 'select'];
    customRules: Rule[] = [];
}
```
##Compiling
Clone the repository. 
In the project root run
```
npm install
npm test
```

##Visual Studio Code

Once installed, you can use make use of Visual Studio Code launcher (`ctrl + f5`). Also allows you to place breakpoints on ts spec files (currently only for those files in `outDir` path in `launch.json` see: https://github.com/Microsoft/vscode/issues/6915) 
  

## Contributors
Special thanks to code / test contributors: 

* **atsu85** - https://github.com/atsu85

If you would like to contribute code or failing tests (for rules you'd like) you are most welcome to do so. 
Please feel free to PR or raise an issue. :)  

##Icon

Icon courtesy of [The Noun Project](https://thenounproject.com/)

[npm-url]: https://npmjs.org/package/aurelia-template-lint
[npm-image]: http://img.shields.io/npm/v/aurelia-template-lint.svg
[npm-downloads]: http://img.shields.io/npm/dm/aurelia-template-lint.svg
[travis-url]: https://travis-ci.org/MeirionHughes/aurelia-template-lint
[travis-image]: https://img.shields.io/travis/MeirionHughes/aurelia-template-lint/master.svg
[breaks-image]: https://img.shields.io/badge/breaks--on-minor-yellow.svg
[stability-image]: https://img.shields.io/badge/stability-2%20%3A%20unstable-red.svg

[gitter-image]: https://img.shields.io/gitter/room/MeirionHughes/aurelia-template-lint.svg
[gitter-url]:https://gitter.im/MeirionHughes/aurelia-template-lint

