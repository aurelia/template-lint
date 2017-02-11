import { Fetch, FetchOptions } from './fetch';
import { Content, ContentKind, SourceFile } from './content';
import { Options } from './options';
import { Path, CaseConvert } from './utils';
import { Reflection } from './reflection';
import { ContentContext } from './context';
import * as ts from 'typescript';

/** project and setup configuration */
export class Config {
  cwd = process.cwd();
  basepath = "./";
  source = "./source/**/*.ts";
  markup = "./source/**/*.html";
  typings = "./typings/**/*.d.ts"; 
  
  /** default Options */
  options = new Options(); 

  /** method used to resolve view -> viewModel*/
  resolveViewModel = aureliaViewModelConvention;
}

export async function aureliaViewModelConvention(ctx: ContentContext) {
  const fetch = ctx.fetch;  
  let view = ctx.content;  

  if (view.kind != ContentKind.Html)
    return undefined;

  if (view.path == null)
    return undefined;

  let baseName = Path.basename(view.path, Path.extname(view.path));
  let viewName = CaseConvert.camelToPascalCase(CaseConvert.kebabToCamelCase(baseName));

  let sourcePath = Path.join(Path.dirname(view.path), baseName);
  let sourceFile = await fetch(sourcePath);

  if (sourceFile == undefined || !Content.isSourceContent(sourceFile))
    return undefined;

  let source = sourceFile.source;
  let exports = Reflection.getExportedClasses(source);

  if (exports == null || exports.length == 0)
    return undefined;


  let candidate: ts.ClassDeclaration | undefined = undefined;

  // If "some-thing.[ts|js]" has any class named SomeThingCustomElement, return it

  candidate = exports.find(x => x.getText().endsWith("CustomElement"));

  if (candidate != undefined) {
    return { file: sourceFile, decl: candidate };
  }

  // If "some-thing.[ts|js]" has any class "SomeThing" + @customElement() decorator, return it

  candidate = exports.find(x => {
    let decos = Reflection.getClassDecorators(x);
    if (decos == undefined)
      return false;

    let decoCustom = decos.filter(y => y.call == "customElement");

    return decoCustom != undefined;
  });

  if (candidate != undefined) {
    return { file: sourceFile, decl: candidate };
  }

  // If "some-thing.[ts|js]" first export is class "SomeThing", return it

  if (exports[0].getText() == viewName)
    candidate = exports[0];

  if (candidate != undefined) {
    return { file: sourceFile, decl: candidate };
  }

  // If "some-thing.[ts|js]" first export is class "Anything", return it (Router case only)

  candidate = exports[0];

  return { file: sourceFile, decl: candidate };
}
