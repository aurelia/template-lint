import { ReflectionHost } from './reflection-host';
import * as ts from 'typescript';

export class Reflection {
  private host = new ReflectionHost();
  private program: ts.Program;

  add(filePath: string, fileContent: string) {
    this.host.add(filePath, fileContent);
  }
}
