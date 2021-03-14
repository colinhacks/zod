export const INVALID = Symbol("invalid_data");
export type INVALID = typeof INVALID;
export namespace util {
  export type AssertEqual<T, Expected> = T extends Expected
    ? Expected extends T
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
}
