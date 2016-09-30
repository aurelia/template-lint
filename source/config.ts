import { Rule } from 'template-lint';

export class Config {

  useRuleAttributeValue = true;         // error on bad attribute value
  useRuleObsoleteAttribute = true;      // error on use of obsolete attributes
  useRuleObsoleteTag = true;            // error on use of obsolete tags
  useRuleConflictingAttribute = true;   // error on use of conflicting attributes
  useRuleSelfClose = true;              // error on self-closed tags
  useRuleStructure = true;              // error on mismatched tags (unclosed)
  useRuleId = true;                     // error on bad id attributes
  useRuleValidChildren = true;          // error on use of invalid child elements 

  useRuleAureliaRequire = true;         // error on bad require tag usage (aurelia-flavor)
  useRuleAureliaSlot = true;            // error on bad slot usage (aurelia-flavor)
  useRuleAureliaTemplate = true;        // error on bad template usage (aurelia-flavor)
  useRuleAureliaBindingAccess = false;  // error on bad view-model binding, when type is known (static type checking)
  useRuleAureliaBindingSyntax = true;   // error on bad binding syntax (as reported by aurelia) 

  /**
   * Attribute Value Rules
   * attr: attributes that matches this reg-ex are checked
   * tag: applies the rule only on a specific element-tag, other-wise applies to all
   * msg: the error to report if the rule fails
   * is: the attribute value must match (entirely) the reg-ex.
   * not: the attribute value must not match (partially) the reg-ex. 
   */
  attributeValueOpts: Array<{ attr: RegExp, is?: RegExp, not?: RegExp, msg?: string, tag?: string }> = [
    {
      attr: /^style$/,
      not: /\${(.?)+}/,
      msg: "interpolation not allowed in style attribute"
    },
    {
      attr: /^bindable$/,
      not: /[a-z][A-Z]/,
      msg: "camelCase bindable is converted to camel-case",
      tag: "template"
    },
    {
      tag: "button",
      attr: /^type$/,
      is: /^button$|^submit$|^reset$|^menu$/,
      msg: "button type invalid"
    }
  ];


  /**
   * Obsolete Tag Rules     
   * tag: the obsolete element
   * msg: the error to report if the element is found
   */
  obsoleteTagOpts: Array<{ tag: string, msg?: string }> = [
    {
      tag: 'content',
      msg: 'use slot instead'
    }
  ];

  /**
  * Obsolete Attribute Rules
  * attr: the attribute name that is obsolete   
  * tag: [optional] obsolete only when applied to a specfic element tag
  * msg: the error to report if the attribute is found
  */
  obsoleteAttributeOpts: Array<{ attr: string, tag?: string, msg?: string }> = [
    //{
    //    attr: "replaceable",
    //    tag: "template",
    //    msg: "has been superceded by the slot element"
    //}
  ];

  /**
  * Conflicting Attribute Rules
  * attrs: the attributes that cannot be used on the same element
  * msg: the error to report if the rule fails
  */
  conflictingAttributeOpts: Array<{ attrs: string[], msg?: string }> = [
    {
      attrs: ["repeat.for", "if.bind", "with.bind"],
      msg: "template controllers shouldn't be placed on the same element"
    }
  ];

  /**
  * ID Attribute Rule
  *
  */
  idAttributeOpts = {
    allowEmptyId: false,
    allowDuplicateId: false,
    allowIllegalChars: false,
    ignoreAny: /\$\{[\s\S]+\}/,
  };

  /**
  * Valid Child Rule
  */
  validChildOpts = [ 
    { element: "tr", allow: ["td", "th"] },
    { element: "ul", allow: ["li"] },
    { element: "ol", allow: ["li"] },
    { element: "dl", allow: ["dt, dd"] },
  ];

  /**
  * Parser Options
  * voids: list of elements that do not have a close tag.   
  * scopes: list of element that change the language scope.  
  */
  parserOpts = {
    voids: ['area', 'base', 'br', 'col', 'embed', 'hr',
      'img', 'input', 'keygen', 'link', 'meta',
      'param', 'source', 'track', 'wbr'],

    scopes: ['html', 'body', 'template', 'svg', 'math']
  };

  /**
  * Aurelia Binding Access Options
  * localProvidors: list of attributes that generate local variables
  * debugReportExceptions: when true, any caught exceptions are reported as rule issues. 
  * restrictedAccess: access to type members with these modifiers will report an issue;
  */
  aureliaBindingAccessOpts = {
    localProvidors: [
      "repeat.for", "if.bind", "with.bind"
    ],
    restrictedAccess: ["private", "protected"]
  };


  /**
  * Aurelia Slot Options
  * controllers: attributes that create template controllers
  */
  aureliaSlotOpts = {
    controllers: [
      "repeat.for", "if.bind", "with.bind"
    ]
  };

  /**
  * Aurelia Template Options
  * containers: html container elements (used to ensure no repeat-for usage)
  */
  aureliaTemplateOpt = {
    containers: ['table', 'select']
  };

  /**
  * Reflection Options
  * sourceFileGlob: glob pattern used to load source files (ts)
  * typingsFileGlob: glob pattern used to load typescript definition files. 
  */
  reflectionOpts = {
    sourceFileGlob: "source/**/*.ts",
    typingsFileGlob: "typings/**/*.d.ts",
  };

  /**
   * report exceptions as issues, where applicable 
   */
  debug = false;

  /**
   * Append the linter rule-set with these rules
   */
  customRules: Rule[] = [];
}
