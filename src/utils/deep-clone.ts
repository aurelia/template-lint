// http://stackoverflow.com/a/40294058/1657476
export function deepClone<T>(obj: T, hash: WeakMap<any, any> = new WeakMap()): T {
  let _obj: any = obj;
  if (Object(_obj) !== _obj) { return _obj; } // primitives
  if (hash.has(_obj)) { return hash.get(_obj); } // cyclic reference
  const result = Array.isArray(_obj) ? []
    : _obj.constructor ? new _obj.constructor() : Object.create(null);
  hash.set(_obj, result);
  if (_obj instanceof Map) {
    Array.from(_obj, ([key, val]) => result.set(key, deepClone(val, hash)));
  }
  return Object.assign(result, ...Object.keys(_obj).map(key => ({ [key]: deepClone(_obj[key], hash) })));
}
