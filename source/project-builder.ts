import { ParserFileTask } from './tasks/parser-file-task';
import { FileTaskChain } from './file-task-chain';
import { Project } from './project';
import { Options } from './options';

export class ProjectBuilder {
  build(opts: Options = {}): Project {
    let project = new Project();
    project.use(this.buildHtmlChain(opts));
    return project;
  }

  private buildHtmlChain(opts: Options) {
    let chain = new FileTaskChain();
    chain.use(this.buildHtmlParser(opts));
    return chain;
  }

  private buildHtmlParser(opts: Options) {
    let parser = new ParserFileTask(opts);
    return parser;
  }
}
