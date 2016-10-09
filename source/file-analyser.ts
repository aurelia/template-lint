import { File } from './file';
import { FileTask } from './file-task';

export class FileAnalyser {
  private chain: FileTask[];

  constructor() {
    this.chain = [];
  }
  
  use(task: FileTask) {    
    this.chain.push(task);
  }

  async analyse(file: File): Promise<File> {
    file = {
      content: file.content,
      kind: file.kind,
      path: file.path
    };

    for (var task of this.chain) {
      let final = await task.process(file);
      if (final)
        break;
    }
    return file;
  }
}
