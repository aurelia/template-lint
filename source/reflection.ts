import { ReflectionHost } from './reflection-host';
import { Path } from './utils/safe-path';
import * as ts from 'typescript';

export class Reflection {
  private options = ts.getDefaultCompilerOptions();
  private _host = new ReflectionHost(this.options);
  private _program= ts.createProgram([], this.options, this._host);

  get host(): ts.CompilerHost {
    return this._host;
  }

  get program() {
    return this._program;
  }

  add(filePath: string, fileContent: string) {
    let source = this._host.add(filePath, fileContent);
    this._program = ts.createProgram(this.getFileNames(), this.options, this._host, this._program);
    return source;
  }

  getFileNames() {
    return this._host.getFileNames();
  }

  getSourceByPath(filePath: string) {
    return this._host.getSourceByPath(filePath);
  }

  getSourceFile(fileName: string) {
    return this._host.getSourceFile(fileName, ts.ScriptTarget.Latest);
  }
}
