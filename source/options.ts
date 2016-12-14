export type ObsoleteElement = { elmt: string, msg?: string };
export type ObsoleteAttribute = { attr: string, elmt?: string, msg?: string };
export type ConflictingAttributeSet = { attrs: string[], msg?: string };

export class Options {
  "process" = true;

  "report-html-self-close" = true;
  "report-html-obsolete-elements" = true;
  "report-html-obsolete-attributes" = true;
  "report-html-require-not-found" = false;
  "report-html-require-view-when-viewmodel-exists" = true;

  "obsolete-elements" = new Array<ObsoleteElement>(
    { elmt: 'content', msg: 'use slot instead' }
  );

  "obsolete-attributes" = new Array<ObsoleteAttribute>(    
  );
}
