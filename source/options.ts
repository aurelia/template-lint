export interface IOptions {
  "source-ext": "ts" | "js";
}

export class Options implements IOptions {
  "source-ext": "ts" | "js" = "ts";

  constructor(opts?: IOptions) {
    if (!opts)
      return;

    this["source-ext"] = opts["source-ext"] || this["source-ext"];
  }
}
