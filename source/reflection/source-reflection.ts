import * as Path from "path";
import * as ts from "typescript";
import * as glob from "glob";
import * as fs from "fs";

/*
* Manage Source Reflection information for available sources
*/
export class SourceReflection {
  public sourceFiles: ts.SourceFile[] = [];
  public pathToSource = {};

  addGlob(pattern?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (pattern) {
          glob(pattern, {}, (er, files) => {
            if (er)
              reject(er);

            files.forEach(path => {
              let source = fs.readFileSync(path, "utf8");
              this.add(path, source);
            });

            resolve();
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  addTypingsGlob(pattern?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        if (pattern) {
          glob(pattern, {}, (er, files) => {
            if (er)
              reject(er);

            files.forEach(path => {
              let source = fs.readFileSync(path, "utf8");
              this.addTypings(source);
            });

            resolve();
          });
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  add(path: string, source: string) {

    let parsed = Path.parse(Path.normalize(path));
    let moduleName = Path.join(parsed.dir, parsed.name);

    if (this.pathToSource[moduleName] !== undefined)
      return;

    let reflection = ts.createSourceFile(moduleName, source, ts.ScriptTarget.Latest, true);
    this.sourceFiles.push(reflection);
    this.pathToSource[moduleName] = reflection;
  }

  addTypings(source: string) {
    let reflection = ts.createSourceFile("", source, ts.ScriptTarget.Latest, true);

    let modules = reflection.statements
      .filter(x => x.kind == ts.SyntaxKind.ModuleDeclaration)
      .map(x => <ts.ModuleDeclaration>x);

    modules.forEach(module => {
      let moduleName = module.name.getText().replace(/\'|\"|\`/g, "");
      this.pathToSource[moduleName] = module;
    });
  }

  getDeclForType(source: ts.SourceFile, typeName: string, isBase: boolean = true): ts.DeclarationStatement | null {
    if (!source || !typeName) return null;

    if (source.kind == ts.SyntaxKind.SourceFile) {
      let types = source.statements.filter(x =>
        x.kind == ts.SyntaxKind.ClassDeclaration ||
        x.kind == ts.SyntaxKind.InterfaceDeclaration);

      let result: ts.DeclarationStatement | null = null;

      if (types)
        result = <ts.DeclarationStatement>types.find(x => (<ts.DeclarationStatement>x).name!.getText() === typeName);

      if (result) return result;

      if (isBase)
        result = this.getDeclForTypeFromImports(source, typeName);
      else
        result = this.getDeclForTypeFromExports(source, typeName);

      return result;
    }
    else if (source.kind == ts.SyntaxKind.ModuleDeclaration) {
      let module = <ts.ModuleDeclaration><any>source;
      let body = module.body;

      if (module.body!.kind == ts.SyntaxKind.ModuleBlock) {
        let moduleBlock = <ts.ModuleBlock>body;

        let classes = moduleBlock.statements.filter(x =>
          x.kind == ts.SyntaxKind.ClassDeclaration ||
          x.kind == ts.SyntaxKind.InterfaceDeclaration);

        return <ts.DeclarationStatement>classes.find(x => (<ts.DeclarationStatement>x).name!.getText() === typeName);
      }
    }
    return null;
  }

  getDeclForTypeFromExports(source: ts.SourceFile, typeName: string): ts.DeclarationStatement | null {
    if (!source || !typeName) return null;

    let exports = source.statements.filter(x => x.kind == ts.SyntaxKind.ExportDeclaration);
    let map: { [id: string]: ts.SourceFile } = {};
    let symbolExportDecl = exports.find(x => {
      if (!(<any>x).exportClause) {
        return true;  // export * from "module"
      }

      // export {Item} from "module"

      let exportSymbols = (<any>x).exportClause.elements;
      if (!exportSymbols) {
        return false;
      }

      let importModule = (<any>x).moduleSpecifier.text;

      let isMatch = exportSymbols.findIndex(exportSymbol => {
        return exportSymbol.name.text == typeName;
      });

      return isMatch != -1;
    });

    if (!symbolExportDecl)
      return null;

    let exportModule = (<any>symbolExportDecl).moduleSpecifier.text;
    let isRelative = exportModule.startsWith(".");
    let exportSourceModule = exportModule;

    if (isRelative) {
      let base = Path.parse(source.fileName).dir;
      exportSourceModule = Path.normalize(Path.join(base, `${exportModule}`));
    }

    let exportSourceFile = this.pathToSource[exportSourceModule];

    if (!exportSourceFile)
      return null;

    return this.getDeclForType(exportSourceFile, typeName, false);
  }

  getDeclForTypeFromImports(source: ts.SourceFile, typeName: string): ts.DeclarationStatement | null {
    if (!source || !typeName) return null;

    let imports = source.statements.filter(x => x.kind == ts.SyntaxKind.ImportDeclaration);
    let map: { [id: string]: ts.SourceFile } = {};
    let symbolImportDecl = imports.find(x => {
      if (!(<any>x).importClause) {
        return false;  // smth like `import "module-name"`
      }
      const namedBindings = (<any>x).importClause.namedBindings;
      if (!namedBindings) {
        return false; // smth like `import defaultMember from "module-name";`;
      }
      let importSymbols = namedBindings.elements;
      if (!importSymbols) {
        return false; // smth like `import * as name from "module-name"`
      }
      let importModule = (<any>x).moduleSpecifier.text;

      let isMatch = importSymbols.findIndex(importSymbol => {
        return importSymbol.name.text == typeName;
      });

      return isMatch != -1;
    });

    if (!symbolImportDecl)
      return null;

    let importModule = (<any>symbolImportDecl).moduleSpecifier.text;
    let isRelative = importModule.startsWith(".");
    let inportSourceModule = importModule;

    if (isRelative) {
      let base = Path.parse(source.fileName).dir;
      inportSourceModule = Path.normalize(Path.join(base, `${importModule}`));
    }

    let inportSourceFile = this.pathToSource[inportSourceModule];

    if (!inportSourceFile)
      return null;

    return this.getDeclForType(inportSourceFile, typeName, false);
  }

  public resolveClassElementType(node: ts.ClassElement): ts.TypeNode | null | undefined {
    if (!node) return null;
    switch (node.kind) {
      case ts.SyntaxKind.PropertyDeclaration:
        let prop = <ts.PropertyDeclaration>node;
        return prop.type;
      case ts.SyntaxKind.MethodDeclaration:
        let meth = <ts.MethodDeclaration>node;
        return meth.type;
      case ts.SyntaxKind.GetAccessor:
        let get = <ts.GetAccessorDeclaration>node;
        return get.type;
      default:
        // console.log(`unhandled kind ${ts.SyntaxKind[node.kind]} in resolveClassElementType`);
        return null;
    }
  }

  public resolveTypeElementType(node: ts.TypeElement): ts.TypeNode | null | undefined {
    if (!node) return null;
    switch (node.kind) {
      case ts.SyntaxKind.PropertySignature:
        let prop = <ts.PropertySignature>node;
        return prop.type;
      case ts.SyntaxKind.MethodSignature:
        let meth = <ts.MethodSignature>node;
        return meth.type;
      default:
        //console.log(`unhandled kind ${ts.SyntaxKind[node.kind]} in resolveTypeElementType`);
        return null;
    }
  }

  public resolveTypeName(node: ts.TypeNode | null): string | null {
    if (!node) return null;
    switch (node.kind) {
      case ts.SyntaxKind.ArrayType:
        let arr = <ts.ArrayTypeNode>node;
        return this.resolveTypeName(arr.elementType);
      case ts.SyntaxKind.TypeReference:
        let ref = <ts.TypeReferenceNode>node;
        if (ref.typeName.getText() == "Array") {
          return this.resolveTypeName(ref.typeArguments![0]);
        }
        return ref.typeName.getText();
      case ts.SyntaxKind.StringKeyword:
        return "string";
      case ts.SyntaxKind.NumberKeyword:
        return "number";
      case ts.SyntaxKind.BooleanKeyword:
        return "boolean";
      default:
        //console.log(`unhandled kind ${ts.SyntaxKind[node.kind]} in resolveTypeName`);
        return null;
    }
  }
}
