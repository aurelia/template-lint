import { Fetch, FetchOptions } from './fetch';
import { File, FileKind } from './file';
import { Options } from './options';
import { Reflection } from './reflection';
import { defaultResolveViewModel } from './conventions';

export class Config {
  debug = true;

  cwd = process.cwd();

  basepath = "./";
  source = "./source/**/*.ts";
  markup = "./source/**/*.html";
  typings = "./typings/**/*.d.ts";

  loaderPattern = /(![A-z]+)/g;
  loaders = new Map<string, (File) => Promise<File>>();

  options = new Options();

  resolveViewModel = defaultResolveViewModel;
}
