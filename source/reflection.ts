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
            let moduleName = module.name.getText();
            console.log(`adding module ${moduleName}`);
            this.pathToSource[moduleName] = module;
        });
    }

    getDeclForImportedType(sourceDecl: ts.Declaration, symbol: string): ts.DeclarationStatement {
        if (!sourceDecl || !symbol) return null;

        let source = <ts.SourceFile>sourceDecl;

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

        console.log(symbol);

        let importModule = (<any>match).moduleSpecifier.text;
        let inportSourceFilePath = Path.normalize(Path.join(base, `${importModule}`));
        let inportSourceFile = this.pathToSource[inportSourceFilePath];

        console.log(this.pathToSource);

        console.log(`import of '${inportSourceFilePath}' okay? ${inportSourceFile != null}`);
        
        if (!inportSourceFile)
            return null;

        console.log(inportSourceFile.kind);

        if(inportSourceFile.kind == ts.SyntaxKind.SourceFile)
        {
            let classes = inportSourceFile.statements.filter(x =>

            x.kind == ts.SyntaxKind.ClassDeclaration ||
            x.kind == ts.SyntaxKind.InterfaceDeclaration);

            return <ts.DeclarationStatement>classes.find(x => (<ts.DeclarationStatement>x).name.getText() == symbol);
        }        
        else if (sourceDecl.kind == ts.SyntaxKind.ModuleDeclaration) {
            let module = <ts.ModuleDeclaration>sourceDecl;
            let body = module.body;

            console.log("module kind");

            if (module.body.kind == ts.SyntaxKind.ModuleBlock) {
                let moduleBlock = <ts.ModuleBlock>body;

                console.log("module body");

                let classes = moduleBlock.statements.filter(x =>
                    x.kind == ts.SyntaxKind.ClassDeclaration ||
                    x.kind == ts.SyntaxKind.InterfaceDeclaration);

                console.log(classes);

                return <ts.DeclarationStatement>classes.find(x => (<ts.DeclarationStatement>x).name.getText() == symbol);
            }
        }
        else{
            console.log("Unknown kind");
        }
    }

    public resolveClassElementType(node: ts.ClassElement): string {
        if (!node) return null;
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
        if (!node) return null;
        switch (node.kind) {
            case ts.SyntaxKind.PropertySignature:
                let prop = <ts.PropertySignature>node
                return this.resolveTypeName(prop.type);
            case ts.SyntaxKind.MethodSignature:
                let meth = <ts.MethodSignature>node
                return this.resolveTypeName(meth.type);
            default:
                console.log(`unhandled kind ${ts.SyntaxKind[node.kind]} in resolveTypeElementType`);
                return null;
        }
    }

    public resolveTypeName(node: ts.TypeNode): string {
        if (!node) return null;
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

