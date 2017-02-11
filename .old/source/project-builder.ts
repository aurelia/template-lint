import { FileTaskChain } from './file-task-chain';
import { File, FileKind } from './file';
import { Project } from './project';
import { Options } from './options';
import { ResourceCollection} from './resource-collection';

import { Reflection } from './reflection';

import { HtmlParseTask } from './tasks/html-parse';
import { HtmlRequireTask } from './tasks/html-require';
import { HtmlViewImportTask } from './tasks/html-view-import';

import { SourceProcessTask } from './tasks/source-process';
import { SourceResourcesTask } from './tasks/source-resources';
import { SourceConfigTask } from './tasks/source-config';

import { IssueSortTask } from './tasks/issue-sort';


export interface IProjectBuilder{
 build(opts: Options): Project;
}

export class ProjectBuilder {

  build(opts: Options = new Options()): Project {

    let project = new Project();
    let reflection = new Reflection();
    let globals = new ResourceCollection();

    // Handle HTML File
    project.use(this.buildHtmlChain(opts));

    // Handle Source File
    project.use(this.buildSourceChain(opts, reflection, globals));

    //Sort the File Issues
    project.use(new IssueSortTask());

    return project;
  }

  private buildHtmlChain(opts: Options) {
    let chain = new FileTaskChain();

    chain.predicate = (x) => x.kind == FileKind.Html;

    chain.use(new HtmlParseTask(opts));
    chain.use(new HtmlRequireTask(opts));
    chain.use(new HtmlViewImportTask(opts));

    return chain;
  }


  private buildSourceChain(opts: Options, reflection: Reflection, globals: ResourceCollection) {
    let chain = new FileTaskChain();

    chain.predicate = (x) => x.kind == FileKind.Source;

    chain.use(new SourceProcessTask(opts, reflection));
    chain.use(new SourceResourcesTask(opts));
    chain.use(new SourceConfigTask(opts, globals));

    return chain;
  }
}
