import { Content } from './content';

export class Linter {
  private _processQueue: Content[] = [];  

  async process(content: Content) {
    this._processQueue.push(content);
  }
}
