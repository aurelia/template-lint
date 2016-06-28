import * as Path from 'path';
import * as ts from 'typescript';
import * as glob from 'glob';
import * as fs from 'fs';

/*
* Manage Reflection information for available sources
*/
export class Reflection {
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
                            let source = fs.readFileSync(path, 'utf8');
                            this.add(path, source);
                        });

                        resolve();
                    });
                }
            } catch (err) {
                reject(err)
            }
        });
    }

    add(path: string, source: string) {

        let sourcePath = Path.normalize(path);

        if (this.pathToSource[sourcePath] !== undefined)
            return;

        let reflection = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true);
        this.sourceFiles.push(reflection);
        this.pathToSource[sourcePath] = reflection;
    }

    getDeclForImportedType(source: ts.SourceFile, symbol: string): ts.DeclarationStatement {
        if(!source || !symbol)return null;

        let base = Path.parse(source.fileName).dir;

        let imports = source.statements
            .filter(x => x.kind == ts.SyntaxKind.ImportDeclaration)

        let map: { [id: string]: ts.SourceFile } = {}

        let match = imports.find(x => {
            let importSymbols = (<any>x).importClause.namedBindings.elements;
            let importModule = (<any>x).moduleSpecifier.text;

            let isMatch = importSymbols.findIndex(importSymbol => {
                return importSymbol.name.text == symbol;
            });

            return isMatch != -1;
        });

        if (!match)
            return null;

        let importModule = (<any>match).moduleSpecifier.text;
        let sourceFilePath = Path.normalize(Path.join(base, `${importModule}.ts`));
        let sourceFile = this.pathToSource[sourceFilePath];

        if (!sourceFile)
            return null;

        let classes = sourceFile.statements.filter(x =>
            x.kind == ts.SyntaxKind.ClassDeclaration ||
            x.kind == ts.SyntaxKind.InterfaceDeclaration);

        return <ts.DeclarationStatement>classes.find(x => (<ts.DeclarationStatement>x).name.getText() == symbol);
    }

    public resolveClassElementType(node: ts.ClassElement): string {
        if(!node)return null;
        switch (node.kind) {
            case ts.SyntaxKind.PropertyDeclaration:
                let prop = <ts.PropertyDeclaration>node
                return this.resolveTypeName(prop.type);
            case ts.SyntaxKind.MethodDeclaration:
                let meth = <ts.MethodDeclaration>node
                return this.resolveTypeName(meth.type);
            default:
                console.log(`unhandled kind ${ts.SyntaxKind[node.kind]} in resolveClassElementType`);
                return null;
        }
    }

    public resolveTypeElementType(node: ts.TypeElement): string {
        if(!node)return null;
        switch (node.kind) {
            case ts.SyntaxKind.PropertySignature:
                let prop = <ts.PropertySignature>node
                return this.resolveTypeName(prop.type);
            case ts.SyntaxKind.PropertySignature:
                let meth = <ts.PropertySignature>node
                return this.resolveTypeName(meth.type);
            default:
                console.log(`unhandled kind ${ts.SyntaxKind[node.kind]} in resolveTypeElementType`);
                return null;
        }
    }

    public resolveTypeName(node: ts.TypeNode): string {
        if(!node)return null;
        switch (node.kind) {
            case ts.SyntaxKind.ArrayType:
                let arr = <ts.ArrayTypeNode>node;
                return this.resolveTypeName(arr.elementType);
            case ts.SyntaxKind.TypeReference:
                let ref = <ts.TypeReferenceNode>node;
                return ref.typeName.getText();
            case ts.SyntaxKind.StringKeyword:
                return 'string';
            case ts.SyntaxKind.NumberKeyword:
                return 'number';
            case ts.SyntaxKind.BooleanKeyword:
                return 'boolean';
            default:
                console.log(`unhandled kind ${ts.SyntaxKind[node.kind]} in resolveTypeName`);
                return null;
        }
    }
}

