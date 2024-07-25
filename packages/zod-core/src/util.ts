import type { AssertEqual, ErrMessage } from "./types.js";

export function assertEqual<A, B>(val: AssertEqual<A, B>): AssertEqual<A, B> {
  return val;
}
export function assertIs<T>(_arg: T): void {}
export function assertNever(_x: never): never {
  throw new Error();
}

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
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
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
