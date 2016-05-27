# aurelia-template-lint

![logo](https://d30y9cdsu7xlg0.cloudfront.net/png/30843-200.png)

Sanity check of Aurelia-flavor Template HTML. 

[![NPM version][npm-image]][npm-url]


##Info
This project was the result of wondering why aurelia applications had missing content when you used self-closing tags. In the end it turns out if your template html is ill formed, the browser parser will not complain and you will simply have missing content and/or an ill formed DOM element tree. 

See: 
* [StackOverflow: aurelia-self-closing-require-element-does-not-work](http://stackoverflow.com/questions/37300986/aurelia-self-closing-require-element-does-not-work)
* [StackOverflow: aurelia-sanity-check-template-html](http://stackoverflow.com/questions/37322985/aurelia-sanity-check-template-html)


This project's intended goal is to sanity check your template html during the development cycle to highlight potential problems. 

## Rules
There are currently a few proof of concept rules, they are: 

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

##Usage

For use with gulp, there is a [gulp plugin available](https://github.com/MeirionHughes/gulp-aurelia-template-lint)

##Icon

Icon courtesy of [The Noun Project](https://thenounproject.com/)

[npm-url]: https://npmjs.org/package/aurelia-template-lint
[npm-image]: http://img.shields.io/npm/v/aurelia-template-lint.svg

