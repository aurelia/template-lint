import { ReflectionHost } from './reflection-host';
import * as ts from 'typescript';

export class Reflection {
  private _host = new ReflectionHost();
  private program: ts.Program;

  get host(): ts.CompilerHost{
    return this._host;
  }

  add(filePath: string, fileContent: string) {
    this._host.add(filePath, fileContent);
  }
}
