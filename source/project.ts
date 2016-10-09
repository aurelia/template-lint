import { SourceReflection } from './reflection/source-reflection';
import { AureliaReflection } from './reflection/aurelia-reflection';
import { FileAnalyser } from './file-analyser';
import { FileTask } from './file-task';
import { File } from './file';
import * as path from 'path';
import { EventEmitter } from 'events';

export class Project extends EventEmitter {

  private results: Map<string, File>;

  private aureliaReflection: AureliaReflection;
  private sourceReflection: SourceReflection;
  private analyser: FileAnalyser;

  constructor() {
    super();

    this.aureliaReflection = new AureliaReflection();
    this.sourceReflection = new SourceReflection();
    this.analyser = new FileAnalyser();
    this.results = new Map<string, File>();
  }

  use(task: FileTask) {
    this.analyser.use(task);
  }

  getResult(path: string) {
    return this.results.get(path);
  }

  async process(file: File): Promise<File> {
    var result = await this.analyser.analyse(file);

    this.addResult(result);
    return result;
  }

  private addResult(file: File) {
    if (!file.path || file.path == "")
      return;

    this.results.set(file.path, file);
  }
}
