import { FileTaskChain } from './file-task-chain';
import { Project } from './project';
import { Options } from './options';
import { Reflection } from './reflection/reflection';

import { HtmlParseTask } from './tasks/html-parse';
import { HtmlRequireTask } from './tasks/html-require';
import { HtmlViewImportTask } from './tasks/html-view-import';

import { SourceProcessTask } from './tasks/source-process';

import { IssueSortTask } from './tasks/issue-sort';


export class ProjectBuilder {

  build(opts: Options = new Options()): Project {

    let project = new Project();
    let reflection = new Reflection();

    // Handle HTML File
    project.use(this.buildHtmlChain(opts));

    // Handle Source File
    project.use(this.buildSourceChain(opts, reflection));

    //Sort the File Issues
    project.use(new IssueSortTask());

    return project;
  }

  private buildHtmlChain(opts: Options) {
    let chain = new FileTaskChain();

    chain.use(new HtmlParseTask(opts));
    chain.use(new HtmlRequireTask(opts));
    chain.use(new HtmlViewImportTask(opts));

    return chain;
  }

  private buildSourceChain(opts: Options, reflection: Reflection) {
    let chain = new FileTaskChain();

    chain.use(new SourceProcessTask(opts, reflection));

    return chain;
  }
}
