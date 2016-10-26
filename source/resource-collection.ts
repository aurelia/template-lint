import {Resource} from './resource';

export class ResourceCollection {
  private _resources = new Array<Resource>();

  add(resource: Resource) {
    this._resources.push(resource);
  }

  remove(resource: Resource) {
    let index = this._resources.indexOf(resource);
    if (index == -1) return;
    this._resources.splice(index, 1);
  }
}
