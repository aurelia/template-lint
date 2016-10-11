import { File } from './file';
import { FileTask } from './file-task';
import { Fetch } from './fetch';

export class FileTaskChain implements FileTask {
  constructor(
    private chain = new Array<FileTask>(), 
    public isFinal: boolean = false) {
  }

  use(task: FileTask) {
    this.chain.push(task);
  }

  async process(file: File, fetch: Fetch): Promise<boolean> {
    for (var task of this.chain) {
      let final = await task.process(file, fetch);
      if (final)
        break;
    }
    return this.isFinal;
  }
}
