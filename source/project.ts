import { SourceReflection } from './reflection/source-reflection';
import { AureliaReflection } from './reflection/aurelia-reflection';
import { FileAnalyser } from './file-analyser';
import { FileTask } from './file-task';
import { Fetch } from './fetch';
import { File } from './file';
import { EventEmitter } from 'events';

import _path = require('path');
import postix = _path.posix;

export class Project extends EventEmitter {
  private results: Map<string, File> = new Map<string, File>();
  private aureliaReflection = new AureliaReflection();
  private sourceReflection = new SourceReflection();
  private analyser = new FileAnalyser();

  constructor() {
    super();
    this.setMaxListeners(100);
  }

  use(task: FileTask) {
    this.analyser.use(task);
  }

  getResult(path: string) {
    return this.results.get(path);
  }

  process(file: File, fetch?: Fetch): Promise<File> {   
    var _fetch = this.createProjectFetch(fetch);

    return this.processWithFetch(file, _fetch);
  }

  private async processWithFetch(file: File, fetch: Fetch): Promise<File> {

    let result = await this.analyser.analyse(file, fetch);

    this.addResult(result);

    return result;
  }

  /**
   * Add a result to the cache if it has a file key
   */
  private addResult(file: File) {
    if (!file.path || file.path == "")
      return;

    this.results.set(file.path, file);
  }

  /**
   * wrap the native fetch 
   */
  private createProjectFetch(fetch?: Fetch): Fetch {
    var cache = this.results;

    var _projectFetch = async (path: string) => {
      var existing = cache[path];

      if (existing)
        return existing;

      if (fetch) {
        const file = await fetch(path);

        var result = await this.processWithFetch(file, _projectFetch);

        return result;
      }

      return undefined;
    };

    return _projectFetch;
  }
}
