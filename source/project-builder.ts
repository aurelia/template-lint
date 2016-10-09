import {ParserFileTask} from './tasks/parser-file-task';
import {FileTaskChain} from './file-task-chain';
import {Project} from './project';
import {Options} from './options';

export class ProjectBuilder{
  build(opts: Options): Project{
    opts = opts || {};

    var project = new Project();

    project.use(this.buildHtmlChain(opts));

    return project;
  }

  private buildHtmlChain(opts: Options){
    var chain = new FileTaskChain();

    chain.use(this.buildHtmlParser(opts));

    return chain;
  }


  private buildHtmlParser(opts: Options){
    var parser = new ParserFileTask(opts);
    return parser;
  }
}
