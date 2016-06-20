import * as Path from 'path';
import * as ts from 'typescript';

/*
* Manage Reflection information for available sources
*/
export class Reflection {
    public sourceFiles: ts.SourceFile[] = [];
    public pathToSource = {};

    add(path: string, source: string) {
        let sourcePath = Path.normalize(path);
        console.log(`added source: ${sourcePath}`);
        let reflection = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true);
        this.sourceFiles.push(reflection);
        this.pathToSource[sourcePath] = reflection;
    }

    getDeclForImportedType(source: ts.SourceFile, symbol: string): ts.ClassDeclaration {

        let imports = source.statements
            .filter(x => x.kind == ts.SyntaxKind.ImportDeclaration)

        let map:{[id:string]:ts.SourceFile} = {}

        let match = imports.find(x => {
            let importSymbols =(<any>x).importClause.namedBindings.elements;
            let importModule = (<any>x).moduleSpecifier.text;

            let isMatch = importSymbols.findIndex(importSymbol=>{

                return importSymbol.name.text == symbol;
            });

            return isMatch != -1;
        });

        if(!match)
            return null;  
            
        let importModule = (<any>match).moduleSpecifier.text;

        let sourceFile =  this.pathToSource[Path.normalize(`${importModule}.ts`)];

        if(!sourceFile)
            return null;

        let classes = sourceFile.statements.filter(x => x.kind == ts.SyntaxKind.ClassDeclaration);

        return <ts.ClassDeclaration>classes.find(x => (<ts.ClassDeclaration>x).name.text == symbol);
    }
}

