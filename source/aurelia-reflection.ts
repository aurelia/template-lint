

import { TemplatingBindingLanguage, InterpolationBindingExpression } from "aurelia-templating-binding";
import { ViewResources, BindingLanguage, BehaviorInstruction } from "aurelia-templating";
import { Container } from "aurelia-dependency-injection";

export class AureliaReflection {
  container: Container;
  resources;
  bindingLanguage;

  constructor() {
    this.container = new Container();
    this.resources = this.container.get(ViewResources);
    this.bindingLanguage = this.container.get(TemplatingBindingLanguage);
  }

  public createAttributeInstruction(tag: string, name: string, value: string): any {

    var instruction: any = null;

    let info: any = this.bindingLanguage.inspectAttribute(this.resources, tag, name, value);
    if (info)
      instruction = this.bindingLanguage.createAttributeInstruction(this.resources, { tagName: tag }, info, undefined);

    return instruction;
  }

  public createTextExpression(text: string): InterpolationBindingExpression {
    var exp: InterpolationBindingExpression = null;
    exp = this.bindingLanguage.inspectTextContent(this.resources, text);
    return exp;
  }

  toDashCase(value: string) {
    return value.replace(/([a-z][A-Z])/g, function (g) { return g[0] + "-" + g[1].toLowerCase(); });
  }

  customElementToDash(value: string) {
    if (value.endsWith("CustomElement"))
      value = value.substring(0, value.length - "CustomElement".length);
    return this.toDashCase(value.charAt(0).toLowerCase() + value.slice(1));
  }
}
