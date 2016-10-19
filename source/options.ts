export class Options {
  "source-ext": "ts" | "js" = "ts";
  "report-html-require-not-found" = false;
  "report-html-require-view-when-viewmodel-exists" = true;

  obsolete = {
    attributes: new Array<{ attr: string, elmt?: string, msg?: string }>(),
    elements: new Array<{ elmt: string, msg?: string }>()
  };

  constructor() {
  }
}
