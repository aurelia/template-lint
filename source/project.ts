import { SourceReflection } from './reflection/source-reflection';
import { AureliaReflection } from './reflection/aurelia-reflection';
import { FileAnalyser } from './file-analyser';
import { FileTask } from './file-task';
import { FileSystem } from './file-system'; 
import { File } from './file';
import * as path from 'path';
import { EventEmitter } from 'events';

export class Project extends EventEmitter {
  private results: Map<string, File>= new Map<string, File>();
  private aureliaReflection = new AureliaReflection();
  private sourceReflection = new SourceReflection();
  private analyser = new FileAnalyser();

  constructor(private fs: FileSystem|null){
    super();
    this.setMaxListeners(100);
  }

  use(task: FileTask) {
    this.analyser.use(task);
  }
  
  getResult(path: string) {
    return this.results.get(path); 
  }

  async process(file: File): Promise<File> {
    let result = await this.analyser.analyse(file);

    this.addResult(result);

    return result;
  }

  private addResult(file: File) {
    if (!file.path || file.path == "")
      return;

    this.results.set(file.path, file);
  }
}
