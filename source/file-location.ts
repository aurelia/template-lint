export class FileLocation {
  line: number;
  column: number;
  start: number;
  end: number;
  constructor(opts: {
    line: number,
    column: number,
    start: number,
    end: number
  }) {
    Object.assign(this, opts);
  }
}
