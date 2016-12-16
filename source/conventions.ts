import { Fetch } from './fetch';
import { File, FileKind } from './file';
import { Reflection } from './reflection';
import { Path } from './utils/safe-path';
import { CaseConvert } from './utils/case-convert';
import * as ts from 'typescript';

export enum ViewModelMode {
  CustomElement,
  Route
}

export type ViewModel = { file: File, decl: ts.ClassDeclaration, mode: ViewModelMode };

export async function defaultResolveViewModel(view: File, fetch: Fetch): Promise<ViewModel | undefined> {
  if (view.kind != FileKind.Html)
    return undefined;

  if (view.path == null)
    return undefined;

  let baseName = Path.basename(view.path, Path.extname(view.path));
  let viewName = CaseConvert.camelToPascalCase(CaseConvert.kebabToCamelCase(baseName));

  let sourcePath = Path.join(Path.dirname(view.path), baseName);
  let sourceFile = await fetch(sourcePath);

  if (sourceFile == null || !sourceFile.isSourceFile())
    return undefined;

  let source = sourceFile.source;
  let exports = Reflection.getExportedClasses(source);

  // Else return undefined
  if (exports == null || exports.length == 0)
    return undefined;

  /* 
  "some-thing.html" -> "some-thing.[ts|js]"    
         If "some-thing.[ts|js]" has any class SomeThingCustomElement, return it
    Else If "some-thing.[ts|js]" has any class "SomeThing" + @customElement() decorator, return it
    Else If "some-thing.[ts|js]" first export is class "SomeThing", return it
    Else If "some-thing.[ts|js]" first export is class "Anything", return it (Router case only)
    Else return undefined
  */

  let candidate: ts.ClassDeclaration | undefined = undefined;

  //If "some-thing.[ts|js]" has any class SomeThingCustomElement, return it

  candidate = exports.find(x => x.getText().endsWith("CustomElement"));

  if (candidate != undefined) {
    return { file: sourceFile, decl: candidate, mode: ViewModelMode.CustomElement };
  }

  // Else If "some-thing.[ts|js]" has any class "SomeThing" + @customElement() decorator, return it

  candidate = exports.find(x => {
    let decos = Reflection.getClassDecorators(x);
    if (decos == undefined)
      return false;

    let decoCustom = decos.filter(y => y.call == "customElement");

    return decoCustom != undefined;
  });

  if (candidate != undefined) {
    return { file: sourceFile, decl: candidate, mode: ViewModelMode.CustomElement };
  }

  //Else If "some-thing.[ts|js]" first export is class "SomeThing", return it

  if (exports[0].getText() == viewName)
    candidate = exports[0];

  if (candidate != undefined) {
    return { file: sourceFile, decl: candidate, mode: ViewModelMode.CustomElement };
  }

  // Else If "some-thing.[ts|js]" first export is class "Anything", return it (Router case only)

  candidate = exports[0];

  return { file: sourceFile, decl: candidate, mode: ViewModelMode.Route };
}
