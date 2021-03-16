export const INVALID = Symbol("invalid_data");
export type INVALID = typeof INVALID;
export namespace util {
  export type AssertEqual<T, Expected> = [T] extends [Expected]
    ? [Expected] extends [T]
      ? true
      : false
    : false;

  export function assertNever(_x: never): never {
    throw new Error();
  }

  export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
  export type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;
  export type MakePartial<T, K extends keyof T> = Omit<T, K> &
    Partial<Pick<T, K>>;

  export const arrayToEnum = <T extends string, U extends [T, ...T[]]>(
    items: U
  ): { [k in U[number]]: k } => {
    const obj: any = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj as any;
  };

  export const getValidEnumValues = (obj: any) => {
    const validKeys = Object.keys(obj).filter(
      (k: any) => typeof obj[obj[k]] !== "number"
    );
    const filtered: any = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return getValues(filtered);
  };

  export const getValues = (obj: any) => {
    return Object.keys(obj).map(function (e) {
      return obj[e];
    });
  };

  export const objectValues = (obj: any) => {
    return Object.keys(obj).map(function (e) {
      return obj[e];
    });
  };

  export const find = <T>(
    arr: T[],
    checker: (arg: T) => any
  ): T | undefined => {
    for (const item of arr) {
      if (checker(item)) return item;
    }
    return undefined;
  };

  export type identity<T> = T;
  export type flatten<T extends object> = identity<{ [k in keyof T]: T[k] }>;

  export type noUndefined<T> = T extends undefined ? never : T;

  export type Path = (string | number)[];
  export const baseGet = (object: any, path: Path) => {
    let index = 0;
    const length = path.length;

    while (object != null && index < length) {
      object = object[path[index++]];
    }
    return index && index == length ? object : undefined;
  };

  export const get = (object: any, path: Path) => {
    const result = object == null ? undefined : baseGet(object, path);
    // return result === undefined ? defaultValue : result;
    return result;
  };

  export const set = (object: any, path: Path, value: any) => {
    console.log(`\nSET`);
    console.log(object, path, value);
    return object == null ? object : baseSet(object, path, value);
  };

  const eq = (value: any, other: any) => {
    return value === other || (value !== value && other !== other);
  };

  const baseAssignValue = (object: any, key: any, value: any) => {
    if (key == "__proto__") {
      Object.defineProperty(object, key, {
        configurable: true,
        enumerable: true,
        value: value,
        writable: true,
      });
    } else {
      object[key] = value;
    }
  };

  const hasOwnProperty = Object.prototype.hasOwnProperty;

  const assignValue = (object: any, key: any, value: any) => {
    console.log(`Assign value`, object, key, value);
    const objValue = object[key];

    if (!(hasOwnProperty.call(object, key) && eq(objValue, value))) {
      if (value !== 0 || 1 / value === 1 / objValue) {
        baseAssignValue(object, key, value);
      }
    } else if (value === undefined && !(key in object)) {
      baseAssignValue(object, key, value);
    }
  };

  const isSymbol = (value: any) => {
    const type = typeof value;
    return type == "symbol";
  };
  /** Used to match property names within property paths. */
  // const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  // const reIsPlainProp = /^\w*$/;

  // const isKey = (value: any, object: any) => {
  //   if (Array.isArray(value)) {
  //     return false;
  //   }
  //   const type = typeof value;
  //   if (
  //     type === "number" ||
  //     type === "boolean" ||
  //     value == null ||
  //     isSymbol(value)
  //   ) {
  //     return true;
  //   }
  //   return (
  //     reIsPlainProp.test(value) ||
  //     !reIsDeepProp.test(value) ||
  //     (object != null && value in Object(object))
  //   );
  // };

  const castPath = (value: Path) => {
    return value;
  };

  /** Used as references for various `Number` constants. */
  const MAX_SAFE_INTEGER = 9007199254740991;

  /** Used to detect unsigned integer values. */
  const reIsUint = /^(?:0|[1-9]\d*)$/;

  const isIndex = (value: any, length?: any) => {
    const type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;

    return (
      !!length &&
      (type === "number" || (type !== "symbol" && reIsUint.test(value))) &&
      value > -1 &&
      value % 1 == 0 &&
      value < length
    );
  };

  const isObject = (value: any) => {
    const type = typeof value;
    return value != null && (type === "object" || type === "function");
  };

  const INFINITY = 1 / 0;

  /**
   * Converts `value` to a string key if it's not a string or symbol.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {string|symbol} Returns the key.
   */
  const toKey = (value: any) => {
    if (typeof value === "string" || isSymbol(value)) {
      return value;
    }
    const result = `${value}`;
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  };

  /**
   * The base implementation of `set`.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {Array|string} path The path of the property to set.
   * @param {*} value The value to set.
   * @param {Function} [customizer] The const to =  customize path creation=>.
   * @returns {Object} Returns `object`.
   */
  const baseSet = (object: any, path: Path, value: any) => {
    if (!isObject(object)) {
      return object;
    }
    path = castPath(path);

    const length = path.length;
    const lastIndex = length - 1;

    let index = -1;
    let nested = object;

    while (nested != null && ++index < length) {
      const key = toKey(path[index]);
      let newValue = value;

      if (index != lastIndex) {
        const objValue = nested[key];
        newValue = undefined;
        // newValue = customizer ? customizer(objValue, key, nested) : undefined;
        if (newValue === undefined) {
          newValue = isObject(objValue)
            ? objValue
            : isIndex(path[index + 1])
            ? []
            : {};
        }
      }

      assignValue(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  };
}
