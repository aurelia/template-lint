import { File } from './file';
import { FileTask } from './file-task';
import { Fetch } from './fetch';

export class FileTaskChain implements FileTask {
  private _predicate = (file: File) => true;
  constructor(
    private chain = new Array<FileTask>(),
    public isFinal = false) {
  }

  use(task: FileTask) {
    this.chain.push(task);
  }

  set predicate(predicate: (file: File) => boolean) {
    this._predicate = predicate;
  }

  async process(file: File, fetch: Fetch): Promise<boolean> {
    if (this._predicate(file))
      for (var task of this.chain) {
        let final = await task.process(file, fetch);
        if (final)
          break;
      }
    return this.isFinal;
  }
}
