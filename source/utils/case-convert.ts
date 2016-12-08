export class CaseConvert {
  static camelToKebabCase(value: string) {
    return value.replace(/([a-z][A-Z])/g, function (g) { return g[0] + "-" + g[1]; }).toLowerCase();
  }

  static kebabToCamelCase(value: string) {
    return value.replace(/(\-\w)/g, function (m) { return m[1].toUpperCase(); });
  }

  static camelToPascalCase(value: string) {    
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  static pascalToCamelCase(value: string) {    
    return value.charAt(0).toLowerCase() + value.slice(1);
  }
}
