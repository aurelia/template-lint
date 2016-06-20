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
}