import { File } from './file';
import { FileTask } from './file-task';

export class FileTaskChain implements FileTask {
  private chain: FileTask[];
  public isFinal: boolean;

  constructor() {
    this.chain = [];
    this.isFinal = false;
  }

  use(task: FileTask) {
    this.chain.push(task);
  }

  async process(file: File): Promise<boolean> {
    for (var task of this.chain) {
      let final = await task.process(file);
      if (final)
        break;
    }
    return this.isFinal;
  }
}
