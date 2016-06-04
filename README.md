# aurelia-template-lint

![logo](https://d30y9cdsu7xlg0.cloudfront.net/png/30843-200.png)

Sanity check of Aurelia-flavor Template HTML. 

[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-downloads]][npm-url]
[![Travis Status][travis-image]][travis-url]

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

##Example
using all the current rules, the example:
```html
 1: <template>
 2:    <require/>
 3:    <require frm="bad"/>
 4:    <require from="good"/>
 5:    
 6:    <div repeat="item of items"/>
 7:    <div repeat.for="item of"/>
 8:    
 9:    <slot></slot>
10:    <slot></slot> 
11:       
12:    <template>
13:        nested templates are bad under aurelia
14:    </template>     
15: </etemps> <!-- oops! -->
```

will result in the following errors:

```
suspected unclosed element detected [ ln: 1 col: 1 ]
self-closing element [ ln: 2 col: 5 ]
require tag is missing a 'from' attribute [ ln: 2 col: 5 ]
self-closing element [ ln: 3 col: 5 ]
require tag is missing a 'from' attribute [ ln: 3 col: 5 ]
self-closing element [ ln: 4 col: 5 ]
self-closing element [ ln: 6 col: 5 ]
did you miss `.for` on repeat? [ ln: 6 col: 5 ]
self-closing element [ ln: 7 col: 5 ]
repeat syntax should be of form `* of *` [ ln: 7 col: 5 ]
more than one default slot detected [ ln: 10 col: 5 ]
nested template found [ ln: 12 col: 5 ]
mismatched close tag [ ln: 15 col: 1 ]
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
  * *don't allow more than one default slot; *  
* **Require**
  * *ensure require elments have a 'from' attribute*
* **RepeatFor**
  * *ensure loop is well formed*
* **Template** 
  * *ensure root is a template element*
  * *no more than one template element present* 
  
I'm more than happy to add or improve rules; 
so please feel free to [create an issue](https://github.com/MeirionHughes/aurelia-template-lint/labels/rule), 
or even a pull request. 

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
         console.log(error.message + " [ ln: " + error.line + " col: " + error.column +" ]" );
      });
  });
```

can be configured by passing a config object

```
const Config = require('aurelia-template-lint').Config

var config = new Config();

config.obsoleteTags.push('my-old-tag');

var linter = new AureliaLinter(config);
```

Config is an object type of the form: 

```
class Config {
    obsoleteTags: Array<string> = ['content'];
    obsoleteAttributes: Array<{ name: string, tag: string }> = [];
    voids: Array<string> = ['area', 'base', 'br', 'col', 'embed', 'hr',
        'img', 'input', 'keygen', 'link', 'meta',
        'param', 'source', 'track', 'wbr'];
    scopes: Array<string> = ['html', 'body', 'template', 'svg', 'math'];
    rules: Rule[] = null;
    customRules: Rule[] = [];
}
```

##Icon

Icon courtesy of [The Noun Project](https://thenounproject.com/)

[npm-url]: https://npmjs.org/package/aurelia-template-lint
[npm-image]: http://img.shields.io/npm/v/aurelia-template-lint.svg
[npm-downloads]: http://img.shields.io/npm/dm/aurelia-template-lint.svg
[travis-url]: https://travis-ci.org/MeirionHughes/aurelia-template-lint
[travis-image]: https://img.shields.io/travis/MeirionHughes/aurelia-template-lint/master.svg