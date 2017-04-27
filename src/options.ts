export type ObsoleteElement = { elmt: string, msg?: string };
export type ObsoleteAttribute = { attr: string, elmt?: string, msg?: string };
export type ConflictingAttributeSet = { attrs: string[], msg?: string };

export class Options {
  "debug" = true;
  "process" = true;
  "strict" = true;

  "report-html-self-close" = true;
  "report-html-obsolete-elements" = true;
  "report-html-obsolete-attributes" = true;
  "report-html-require-not-found" = false;
  "report-html-require-view-when-viewmodel-exists" = true;

  "obsolete-elements" = [
    { elmt: 'content', msg: 'use slot instead' }
  ] as ObsoleteElement[];

  "obsolete-attributes" = [] as ObsoleteAttribute[];
}
