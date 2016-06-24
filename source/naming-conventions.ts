export interface INamingConvention{
  toSymbol(path:string):string;
  toFile(symbol:string):string;
}

export class DefaultNamingConvention implements INamingConvention
{
  toSymbol(path:string):string{
    path = this.toCamelCase(path.trim());
    return path.charAt(0).toUpperCase() + path.slice(1);    
  }

  toFile(symbol:string)
  {
    return this.toDashCase(symbol.trim());
  }

  toCamelCase(value:string)
  {
    return value.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
  } 

  toDashCase(value:string)
  {
    return value.replace(/([a-z][A-Z])/g, function (g) { return g[0] + '-' + g[1].toLowerCase() });
  } 
} 