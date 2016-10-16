import { FileTaskChain } from './file-task-chain';
import { Project } from './project';
import { Options } from './options';

import { HtmlParseTask } from './tasks/html-parse';
import { HtmlRequireTask } from './tasks/html-require';
import { HtmlViewImportTask } from './tasks/html-view-import';


export class ProjectBuilder {

  build(opts: Options = new Options()): Project {

    let project = new Project();

    project.use(
      new FileTaskChain([
        this.buildHtmlChain(opts)
      ]));

    return project;
  }

  private buildHtmlChain(opts: Options) {
    let chain = new FileTaskChain();

    chain.use(new HtmlParseTask(opts));
    chain.use(new HtmlRequireTask(opts));
    chain.use(new HtmlViewImportTask(opts));
    //chain.use(new ResolveResourcesTask(project));

    return chain;
  }
}
