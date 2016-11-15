import { Fetch, FetchOptions } from './fetch';
import { File } from './file';
import { Options } from './options';

export class Config {
  debug = true;

  cwd: string = process.cwd();

  basepath = "./";
  source = "./source/**/*.ts";
  markup = "./source/**/*.html";
  typings = "./typings/**/*.d.ts";

  loaderPattern = /(![A-z]+)/g;
  loaders = new Map<string, (File) => Promise<File>>();

  options: Options;  
}
