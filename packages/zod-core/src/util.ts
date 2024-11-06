import type { AssertEqual, ErrMessage, ParsedTypes } from "./types.js";

export function assertEqual<A, B>(val: AssertEqual<A, B>): AssertEqual<A, B> {
  return val;
}
export function assertIs<T>(_arg: T): void {}
export function assertNever(_x: never): never {
  throw new Error();
}
export function assert<T>(_: any): asserts _ is T {}
export function arrayToEnum<T extends string, U extends [T, ...T[]]>(
  items: U
): { [k in U[number]]: k } {
  const obj: any = {};
  for (const item of items) {
    obj[item] = item;
  }
  return obj as any;
}

export function getValidEnumValues(obj: any): any {
  const validKeys = objectKeys(obj).filter(
    (k: any) => typeof obj[obj[k]] !== "number"
  );
  const filtered: any = {};
  for (const k of validKeys) {
    filtered[k] = obj[k];
  }
  return objectValues(filtered);
}

export function objectValues(obj: any): any {
  return objectKeys(obj).map((e) => obj[e]);
}

export const objectKeys: ObjectConstructor["keys"] =
  typeof Object.keys === "function"
    ? (obj: any) => Object.keys(obj)
    : (object: any) => {
        const keys = [];
        for (const key in object) {
          if (Object.prototype.hasOwnProperty.call(object, key)) {
            keys.push(key);
          }
        }
        return keys;
      };

export const isInteger: NumberConstructor["isInteger"] =
  typeof Number.isInteger === "function"
    ? (val) => Number.isInteger(val)
    : (val) =>
        typeof val === "number" &&
        Number.isFinite(val) &&
        Math.floor(val) === val;

export function joinValues<T extends any[]>(
  array: T,
  separator = " | "
): string {
  return array
    .map((val) => (typeof val === "string" ? `'${val}'` : val))
    .join(separator);
}
export function jsonStringifyReplacer(_: string, value: any): any {
  if (typeof value === "bigint") return value.toString();
  return value;
}

export function cached<This, T>(
  th: This,
  key: string,
  getter: () => T & ThisType<This>
): T {
  Object.defineProperty(th, key, {
    get() {
      const value = getter();
      Object.defineProperty(th, key, {
        value,
        configurable: true,
      });
      return value;
    },
    configurable: true,
  });
  return undefined as any;
}

export function makeCache<This, T extends { [k: string]: () => unknown }>(
  th: This,
  elements: T & ThisType<This>
): { [k in keyof T]: ReturnType<T[k]> } {
  const cache: { [k: string]: unknown } = {};
  for (const key in elements) {
    const getter = elements[key].bind(th);
    Object.defineProperty(cache, key, {
      get() {
        const value = getter();
        Object.defineProperty(cache, key, {
          value,
          configurable: true,
        });
        return value;
      },
      configurable: true,
    });
  }
  return cache as any;
}

export const errToObj = (message?: ErrMessage): { message?: string } =>
  typeof message === "string" ? { message } : message || {};

export const errToString = (message?: ErrMessage): string | undefined =>
  typeof message === "string" ? message : message?.message;

export function getElementAtPath(
  obj: any,
  path: (string | number)[] | null | undefined
): any {
  if (!path) return obj;
  return path.reduce((acc, key) => acc?.[key], obj);
}

export function promiseAllObject<T extends object>(promisesObj: T): Promise<T> {
  const keys = Object.keys(promisesObj);
  const promises = keys.map((key) => (promisesObj as any)[key]);

  return Promise.all(promises).then((results) => {
    const resolvedObj: any = {};
    for (let i = 0; i < keys.length; i++) {
      resolvedObj[keys[i]] = results[i];
    }
    return resolvedObj;
  });
}

export function isPlainObject(data: any): data is Record<PropertyKey, unknown> {
  return (
    typeof data === "object" &&
    data !== null &&
    Object.getPrototypeOf(data) === Object.prototype
  );
}

export const getParsedType = (data: any): ParsedTypes => {
  const t = typeof data;

  switch (t) {
    case "undefined":
      return "undefined";

    case "string":
      return "string";

    case "number":
      return Number.isNaN(data) ? "nan" : "number";

    case "boolean":
      return "boolean";

    case "function":
      return "function";

    case "bigint":
      return "bigint";

    case "symbol":
      return "symbol";

    case "object":
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
      }
      if (
        data.then &&
        typeof data.then === "function" &&
        data.catch &&
        typeof data.catch === "function"
      ) {
        return "promise";
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return "map";
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return "set";
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return "date";
      }
      if (typeof File !== "undefined" && data instanceof File) {
        return "file";
      }
      return "object";

    default:
      throw new Error(`Unknown data type: ${t}`);
  }
};

export const propertyKeyTypes: Set<string> = new Set([
  "string",
  "number",
  "symbol",
]);

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
