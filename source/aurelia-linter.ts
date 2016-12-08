import { Linter, Rule, Issue, IssueSeverity } from 'template-lint';

import { ParserBuilder } from 'template-lint';
import { SelfCloseRule } from 'template-lint';
import { StructureRule } from 'template-lint';
import { ObsoleteTagRule } from 'template-lint';
import { ObsoleteAttributeRule } from 'template-lint';
import { IdAttributeRule } from 'template-lint';
import { AttributeValueRule } from 'template-lint';
import { ValidChildRule } from 'template-lint';
import { ConflictingAttributesRule, ConflictingAttributes } from 'template-lint';


import { RequireRule } from './rules/require';
import { SlotRule } from './rules/slot';
import { TemplateRule } from './rules/template';
import { BindingRule } from './rules/binding';

import { Reflection } from './reflection';
import { AureliaReflection } from './aurelia-reflection';
import { Config } from './config';

import { initialize } from 'aurelia-pal-nodejs';

initialize();

export class AureliaLinter {
  linter: Linter;
  reflection: Reflection;
  auReflection: AureliaReflection;
  config: Config;

  private init: Promise<void>;

  constructor(config?: Config) {

    if (config == undefined)
      config = new Config();

    this.config = config;
    this.reflection = new Reflection();
    this.auReflection = new AureliaReflection();

    let rules = [];

    if (this.config.useRuleSelfClose)
      rules.push(new SelfCloseRule());
    if (this.config.useRuleStructure)
      rules.push(new StructureRule());
    if (this.config.useRuleObsoleteAttribute)
      rules.push(new ObsoleteAttributeRule(config.obsoleteAttributeOpts));
    if (this.config.useRuleObsoleteTag)
      rules.push(new ObsoleteTagRule(config.obsoleteTagOpts));
    if (this.config.useRuleAttributeValue)
      rules.push(new AttributeValueRule(config.attributeValueOpts));
    if (this.config.useRuleConflictingAttribute)
      rules.push(new ConflictingAttributesRule(<ConflictingAttributes[]>config.conflictingAttributeOpts));
    if (this.config.useRuleId)
      rules.push(new IdAttributeRule(this.config.idAttributeOpts));
    if (this.config.useRuleValidChildren)
      rules.push(new ValidChildRule(this.config.validChildOpts));

    if (this.config.useRuleAureliaRequire)
      rules.push(new RequireRule());
    if (this.config.useRuleAureliaSlot)
      rules.push(new SlotRule(config.aureliaSlotOpts.controllers));
    if (this.config.useRuleAureliaTemplate)
      rules.push(new TemplateRule(config.aureliaTemplateOpt.containers));

    if (this.config.useRuleAureliaBindingAccess || this.config.useRuleAureliaBindingSyntax)
      rules.push(
        new BindingRule(
          this.reflection,
          this.auReflection,
          {
            reportBindingSyntax: this.config.useRuleAureliaBindingSyntax,
            reportBindingAccess: this.config.useRuleAureliaBindingAccess,
            reportUnresolvedViewModel: this.config.aureliaBindingAccessOpts.reportUnresolvedViewModel,
            reportExceptions: this.config.debug,
            localProvidors: this.config.aureliaBindingAccessOpts.localProvidors,
            restrictedAccess: this.config.aureliaBindingAccessOpts.restrictedAccess
          }));

    if (this.config.customRules)
      rules.concat(config.customRules);

    var parserBuilder = new ParserBuilder()
      .withVoids(this.config.parserOpts.voids)
      .withScopes(this.config.parserOpts.scopes);

    this.linter = new Linter(
      rules,
      parserBuilder
    );

    this.init = this.reflection.addGlob(this.config.reflectionOpts.sourceFileGlob)
      .then(() => {
        if (this.config.reflectionOpts.typingsFileGlob != null)
          return this.reflection.addTypingsGlob(this.config.reflectionOpts.typingsFileGlob);
        else return Promise.resolve();
      });
  }

  public lint(html: string, path?: string): Promise<Issue[]> {
    if (this.init) {
      return this.init.then(() => {
        this.init = null;
        return this.linter.lint(html, path);
      });
    }
    else {
      return this.linter.lint(html, path);
    }
  }
}
