import { FileTaskChain } from './file-task-chain';
import { Project } from './project';
import { Options } from './options';

import { HtmlParseTask } from './tasks/html-parse';
import { HtmlRequireTask } from './tasks/html-require';

export class ProjectBuilder {
  build(opts: Options = {}): Project {

    let project = new Project();

    project.use(
      new FileTaskChain([
        this.buildHtmlChain(opts)
      ]));

    return project;
  }

  private buildHtmlChain(opts: Options) {
    let chain = new FileTaskChain();

    chain.use(this.buildHtmlParser(opts));
    chain.use(new HtmlRequireTask(opts));
    //chain.use(new ResolveImportsTask(opts, project));
    //chain.use(new ResolveResourcesTask(project));

    return chain;
  }

  private buildHtmlParser(opts: Options) {
    let parser = new HtmlParseTask(opts);
    return parser;
  }


}
