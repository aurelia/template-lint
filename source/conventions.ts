import { Fetch } from './fetch';
import { File, FileKind } from './file';
import { Reflection } from './reflection';
import { Path } from './utils/safe-path';

export async function defaultResolveViewModel(view: File, fetch: Fetch, reflection: Reflection): Promise<File | undefined> {
  if (view.kind != FileKind.Html)
    return undefined;

  if (view.path == null)
    return undefined;

  /* 
  "some-thing.html" -> "some-thing.[ts|js]"    
    If "some-thing.[ts|js]" has class SomeThingCustomElement, return it
    Else If "some-thing.[ts|js]" first export is class "SomeThing", return it
    Else If "some-thing.[ts|js]" first export is class "Anything", return it
    Else return undefined
  */

  return undefined;
}
