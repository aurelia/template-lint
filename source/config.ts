import { Fetch, FetchOptions } from './fetch';
import { File } from './file';
import { Options } from './options';

export class Config {
  debug = true;

  basePath = "./";
  source = "./source/**/*.ts";
  markup = "./source/**/*.html";
  typings = "./typings/**/*.d.ts";

  loader = /(![A-z]+)/g;
  plugins = new Map<string, Fetch>();

  options: Options;
  overrides = new Map<string, Options>();
}
