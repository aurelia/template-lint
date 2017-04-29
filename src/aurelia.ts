import { Content, ContentContext, ContentKind } from './content';
import { Path, CaseConvert } from './utils';
import { Reflection } from './reflection';
import * as ts from 'typescript';

/** aurelia reflection helper */
export class Aurelia {

  /** find the class declaration within a target file **/
  async resolveViewModelDecl(target: ContentContext): Promise<ts.ClassDeclaration | undefined> {

    return undefined;

    /*let baseName = Path.basename(target.content.path, Path.extname(target.path));
    let viewName = CaseConvert.camelToPascalCase(CaseConvert.kebabToCamelCase(baseName));

    let sourcePath = Path.join(Path.dirname(view.path), baseName);
    let sourceFile = await fetch(sourcePath);

    if (sourceFile === undefined || !Content.isSourceContent(sourceFile)) {
      return undefined;
    }

    let source = sourceFile.source;
    let exports = Reflection.getExportedClasses(source);

    if (exports === undefined || exports.length === 0) {
      return undefined;
    }

    let candidate: ts.ClassDeclaration | undefined = undefined;

    // If "some-thing.[ts|js]" has any class named SomeThingCustomElement, return it

    candidate = exports.find(x => x.getText().endsWith("CustomElement"));

    if (candidate !== undefined) {
      return { file: sourceFile, decl: candidate };
    }

    // If "some-thing.[ts|js]" has any class "SomeThing" + @customElement() decorator, return it

    candidate = exports.find(x => {
      let decos = Reflection.getClassCallDecorators(x);
      if (decos === undefined) {
        return false;
      }

      let decoCustom = decos.filter(y => y.call === "customElement");

      return decoCustom !== undefined;
    });

    if (candidate !== undefined) {
      return { file: sourceFile, decl: candidate };
    }

    // If "some-thing.[ts|js]" first export is class "SomeThing", return it

    if (exports[0].getText() === viewName) {
      candidate = exports[0];
    }

    if (candidate !== undefined) {
      return { file: sourceFile, decl: candidate };
    }

    // If "some-thing.[ts|js]" first export is class "Anything", return it (Router case only)

    candidate = exports[0];

    return { file: sourceFile, decl: candidate };*/
  };
}
