import { FileAnalyser } from './file-analyser';
import { FileTask } from './file-task';
import { Fetch, FetchOptions } from './fetch';
import { File } from './file';
import { EventEmitter } from 'events';

export class Project extends EventEmitter {
  private results: Map<string, File> = new Map<string, File>();
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

  getResults() {
    return this.results.values;
  }

  process(file: File, fetch?: Fetch): Promise<File> {
    var _fetch = this.wrapFetchWithCache(fetch);

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
  private wrapFetchWithCache(fetch?: Fetch): Fetch {
    
    var cache = this.results;

    var _projectFetch = async (path: string, opts?: FetchOptions) => {
      if (fetch) {
        const file = await fetch(path);
        const filePath = file.path;

        if (filePath && cache[filePath]) {
          return cache[filePath];
        }

        if (!opts || opts.process)
          var result = await this.processWithFetch(file, _projectFetch);

        return result;
      }

      return undefined;
    };

    return _projectFetch;
  }
}
