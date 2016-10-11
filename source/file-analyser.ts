import { File } from './file';
import { FileTask } from './file-task';
import { Fetch } from './fetch';

export class FileAnalyser {
  private chain: FileTask[];

  constructor() {
    this.chain = [];
  }

  use(task: FileTask) {
    this.chain.push(task);
  }

  async analyse(file: File, fetch: Fetch): Promise<File> {
    let _file = new File({
      content: file.content,
      kind: file.kind,
      path: file.path
    });

    for (var task of this.chain) {
      let handled = await task.process(_file, fetch);
      if (handled)
        break;
    }

    return _file;
  }
}
