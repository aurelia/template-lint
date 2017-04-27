import { Path } from './utils';
import * as ts from 'typescript';
import * as fs from "fs";

export class Reflection {
  private _options: ts.CompilerOptions = ts.getDefaultCompilerOptions();
  private _host: ReflectionHost = new ReflectionHost(this._options);
  private _program: ts.Program = ts.createProgram([], this._options, this._host);

  get host(): ts.CompilerHost {
    return this._host;
  }

  get program(): ts.Program {
    return this._program;
  }

  add(filePath: string, fileContent: string): ts.SourceFile | undefined {
    let source = this._host.add(filePath, fileContent);
    this._program = ts.createProgram(this.getFileNames(), this._options, this._host, this._program);
    return source;
  }

  getFileNames(): string[] {
    return this._host.getFileNames();
  }

  getSourceByPath(filePath: string): ts.SourceFile | undefined {
    return this._host.getSourceByPath(filePath);
  }

  getSourceFile(fileName: string): ts.SourceFile | undefined {
    return this._host.getSourceFile(fileName, ts.ScriptTarget.Latest);
  }

  static getExportedClasses(source: ts.SourceFile): ts.ClassDeclaration[] {
    return source.statements.filter(x => x.kind === ts.SyntaxKind.ClassDeclaration && this.isNodeExported(x)).map(x => <ts.ClassDeclaration>x);
  }

  static getClassCallDecorators(decl: ts.ClassDeclaration): Array<{ call: string, args: ts.Expression[] }> | undefined {
    if (decl.decorators === undefined) {
      return undefined;
    }

    let decorators = new Array<{ call: string, args: Array<ts.Expression> }>();

    for (const decorator of decl.decorators) {
      const exp = decorator.expression;

      if (this.isCallExpression(exp)) {
        let callStr = exp.expression.getText();
        let args = exp.arguments;

        decorators.push({ call: callStr, args: args });
      }
    }
    return decorators;
  }

  static isNodeExported(node: ts.Node): boolean {
    return ((node.flags & ts.NodeFlags.ExportContext) !== 0) && (node.parent !== undefined && node.parent.kind === ts.SyntaxKind.SourceFile);
  }

  static isCallExpression(node: ts.Node): node is ts.CallExpression {
    return node.kind === ts.SyntaxKind.CallExpression;
  }
}

export class ReflectionHost implements ts.CompilerHost {
  private files: Map<string, { content: string, source: ts.SourceFile, rev: number }> = new Map();

  constructor(public options: ts.CompilerOptions) {
    const defLibPath = ts.getDefaultLibFilePath(this.options);
    const defLib = fs.readFileSync(defLibPath, "utf8");
    const defLibName = Path.basename(defLibPath);

    this.add(defLibName, defLib);
  }

  getFileNames(): string[] {
    const names = Array<string>();

    this.files.forEach((_, k) => {
      names.push(k);
    });

    return names;
  }

  getSourceByPath(filePath: string): ts.SourceFile | undefined {
    filePath = Path.normalize(filePath);
    if (this.files.has(filePath)) {
      return;
    }

    const entry = this.files.get(filePath);

    if (!entry) {
      return;
    }

    return entry.source;
  }

  add(filePath: string, fileContent: string): ts.SourceFile {
    filePath = Path.normalize(filePath);

    if (this.files.has(filePath)) {
      return this.files.get(filePath)!.source;
    }

    const fileSource = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);

    this.files.set(filePath, { content: fileContent, source: fileSource, rev: 1 });

    return fileSource;
  }

  fileExists = (fileName: string) => this.files.has(Path.normalize(fileName));
  readFile = (fileName: string) => {
    //console.log("readFile", fileName);

    return this.files.get(Path.normalize(fileName))!.content;
  }
  //trace?(s: string): void;
  //directoryExists?(directoryName: string): boolean;
  //realpath?(path: string): string;
  getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget) => {
    //console.log("getSourceFile", fileName);

    let name = Path.normalize(fileName);
    let file = this.files.get(name);

    return file!.source;
  }
  //getSourceFileByPath?(fileName: string, path: Path, languageVersion: ScriptTarget, onError?: (message: string) => void): SourceFile;
  //getCancellationToken?(): CancellationToken;
  getDefaultLibFileName = (options) => Path.basename(ts.getDefaultLibFilePath(options))
  //getDefaultLibLocation?(): string;
  writeFile = (name, text, writeByteOrderMark) => { }
  getCurrentDirectory = () => ""
  getDirectories = (path: string) => [];
  getCanonicalFileName = fileName => Path.normalize(fileName);
  useCaseSensitiveFileNames = () => false;
  getNewLine = () => '\r';
  //resolveModuleNames?(moduleNames: string[], containingFile: string): ResolvedModule[];
  /**
   * This method is a companion for 'resolveModuleNames' and is used to resolve 'types' references to actual type declaration files
   */
  //resolveTypeReferenceDirectives?(typeReferenceDirectiveNames: string[], containingFile: string): ResolvedTypeReferenceDirective[];
}
