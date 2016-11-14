export type obsoleteElement = { elmt: string, msg?: string };
export type obsoleteAttribute = { attr: string, elmt?: string, msg?: string };
export type conflictingAttributeSet = { attrs: string[], msg?: string };

export class Options {
  "process" = true;
  "source-ext": "ts" | "js" = "ts"; // TODO: remove... 
  "obsolete-elements" = new Array<obsoleteElement>(
    { elmt: 'content', msg: 'use slot instead' }
  );
  "obsolete-attributes" = new Array<obsoleteAttribute>();

  "report-html-self-close" = true;
  "report-html-obsolete-elements" = true;
  "report-html-obsolete-attributes" = true;
  "report-html-require-not-found" = false;
  "report-html-require-view-when-viewmodel-exists" = true;
}
