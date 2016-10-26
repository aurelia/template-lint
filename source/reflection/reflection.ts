import { ReflectionHost } from './reflection-host';
import * as ts from 'typescript';

export class Reflection {
  private options = ts.getDefaultCompilerOptions();
  private program: ts.Program;
  private _host = new ReflectionHost(this.options);

  constructor() {
    this.program = ts.createProgram([], this.options, this._host);
  }

  get host(): ts.CompilerHost {
    return this._host;
  }

  get typeChecker(): ts.TypeChecker {
    return this.program.getTypeChecker();
  }

  getFileNames() {
    return this._host.getFileNames();
  }

  add(filePath: string, fileContent: string) {
    let source = this._host.add(filePath, fileContent);
    this.program = ts.createProgram(this.getFileNames(), this.options, this._host);
  }
}
