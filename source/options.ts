export class Options {
  "source-ext": "ts" | "js" = "ts";
  "require-report-not-found" = false;

  constructor(opts?: {
    "source-ext"?: "ts" | "js",
    "require-report-not-found"?: boolean
  }) {

    if (!opts)
      return;

    Object.assign(this, opts);
  }
}
