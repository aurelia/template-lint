export class CaseConvert {
  static camelToKebabCase(value: string): string {
    return value.replace(/([a-z][A-Z])/g, (g) => { return g[0] + "-" + g[1]; }).toLowerCase();
  }

  static kebabToCamelCase(value: string): string {
    return value.replace(/(\-\w)/g, (m) => { return m[1].toUpperCase(); });
  }

  static camelToPascalCase(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  static pascalToCamelCase(value: string): string {
    return value.charAt(0).toLowerCase() + value.slice(1);
  }
}
