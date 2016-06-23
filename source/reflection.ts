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
            if (pattern) {
                glob(pattern, {}, (er, files) => {
                    if(er)
                       reject();

                    files.forEach(path => {
                        let source = fs.readFileSync(path, 'utf8');
                        this.add(path, source);
                    });

                    resolve();
                });
            }
        });
    }

    add(path: string, source: string) {

        let sourcePath = Path.normalize(path);

        if(this.pathToSource[sourcePath] !== undefined)
            return;

        let reflection = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true);
        this.sourceFiles.push(reflection);
        this.pathToSource[sourcePath] = reflection;
    }

    getDeclForImportedType(source: ts.SourceFile, symbol: string): ts.DeclarationStatement {

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
}

