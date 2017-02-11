import { expect } from 'chai';
import {ReflectionHost} from '../src/reflection-host';
import * as ts from 'typescript';

describe("Linter", () => {
  it("", () => {
    let a = 10;
    let host = new ReflectionHost(ts.getDefaultCompilerOptions());
  });
});
