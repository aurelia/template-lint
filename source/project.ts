import { SourceReflection } from './reflection/source-reflection';
import { AureliaReflection } from './reflection/aurelia-reflection';
import { FileAnalyser } from './file-analyser';
import { FileTask } from './file-task';
import { File } from './file';
import * as path from 'path';

export class Project {
  private aureliaReflection: AureliaReflection;
  private sourceReflection: SourceReflection;
  private analyser: FileAnalyser;

  constructor() {
    this.aureliaReflection = new AureliaReflection();
    this.sourceReflection = new SourceReflection();
    let analyser = new FileAnalyser();
  }

  use(task: FileTask) {
    this.analyser.use(task);
  }

  async process(file: File): Promise<File> {
    return await this.analyser.analyse(file);
  }
}
