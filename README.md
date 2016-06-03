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
aurelia-template-lint extends upon [template-lint](https://github.com/MeirionHughes/template-lint/) (the base lint project) to add aurelia-specific rules.  

See: 
* [StackOverflow: aurelia-self-closing-require-element-does-not-work](http://stackoverflow.com/questions/37300986/aurelia-self-closing-require-element-does-not-work)
* [StackOverflow: aurelia-sanity-check-template-html](http://stackoverflow.com/questions/37322985/aurelia-sanity-check-template-html)

##Example
using all the current rules, the example:
```html
<template>
    <require/>
    <require frm="bad"/>
    <require from="good"/>
    
    <slot>lint will not like non-whitespace under projection targets</slot>
        
    <template>
        this is bad under aurelia
    </template>  
    
</etemps> <!-- oops! -->
```

will result in the following errors:

```
WARNING: self-closing element, line: 2, column: 5 \source\example.html
WARNING: self-closing element, line: 3, column: 5 \source\example.html
WARNING: self-closing element, line: 4, column: 5 \source\example.html
WARNING: mismatched close tag, line: 12, column: 1 \source\example.html
WARNING: suspected unclosed element detected, line: 1, column: 1 \source\example.html
WARNING: found content within projection target (slot), line: 6, column: 5 \source\example.html
WARNING: nested template found, line: 8, column: 5 \source\example.html
WARNING: require tag is missing a 'from' attribute, line: 2, column: 5 \source\example.html
WARNING: require tag is missing a 'from' attribute, line: 3, column: 5 \source\example.html
```

## Rules
There are currently a rules, they are: 

* **SelfClose** 
  * *ensure non-void elements do not self-close* 
* **Template** 
  * *ensure root is a template element*
  * *no more than one template element present* 
* **RouterView**
  * *don't allow router-view element to contain content elements*
* **Require**
  * *ensure require elments have a 'from' attribute*
* **Parser**
  * *returns detected unclosed/ill-matched elements errors captured during parsing*
  
[More rules are planned](https://github.com/MeirionHughes/aurelia-template-lint/labels/rule)
I'm more than happy to add or improve rules; so please feel free to create an issue. 

##Usage

For use with gulp, there is a [gulp plugin available](https://github.com/MeirionHughes/gulp-aurelia-template-lint)

##Icon

Icon courtesy of [The Noun Project](https://thenounproject.com/)

[npm-url]: https://npmjs.org/package/aurelia-template-lint
[npm-image]: http://img.shields.io/npm/v/aurelia-template-lint.svg
[npm-downloads]: http://img.shields.io/npm/dm/aurelia-template-lint.svg
[travis-url]: https://travis-ci.org/MeirionHughes/aurelia-template-lint
[travis-image]: https://img.shields.io/travis/MeirionHughes/aurelia-template-lint/master.svg