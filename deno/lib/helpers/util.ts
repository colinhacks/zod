export namespace util {
  type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <
    V
  >() => V extends U ? 1 : 2
    ? true
    : false;

  export type isAny<T> = 0 extends 1 & T ? true : false;
  export const assertEqual = <A, B>(val: AssertEqual<A, B>) => val;
  export function assertIs<T>(_arg: T): void {}
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
    const validKeys = objectKeys(obj).filter(
      (k: any) => typeof obj[obj[k]] !== "number"
    );
    const filtered: any = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return objectValues(filtered);
  };

  export const objectValues = (obj: any) => {
    return objectKeys(obj).map(function (e) {
      return obj[e];
    });
  };

  export const objectKeys: ObjectConstructor["keys"] =
    typeof Object.keys === "function" // eslint-disable-line ban/ban
      ? (obj: any) => Object.keys(obj) // eslint-disable-line ban/ban
      : (object: any) => {
          const keys = [];
          for (const key in object) {
            if (Object.prototype.hasOwnProperty.call(object, key)) {
              keys.push(key);
            }
          }
          return keys;
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

  export type identity<T> = objectUtil.identity<T>;
  export type flatten<T> = objectUtil.flatten<T>;

  export type noUndefined<T> = T extends undefined ? never : T;

  export const isInteger: NumberConstructor["isInteger"] =
    typeof Number.isInteger === "function"
      ? (val) => Number.isInteger(val) // eslint-disable-line ban/ban
      : (val) =>
          typeof val === "number" && isFinite(val) && Math.floor(val) === val;

  export function joinValues<T extends any[]>(
    array: T,
    separator = " | "
  ): string {
    return array
      .map((val) => (typeof val === "string" ? `'${val}'` : val))
      .join(separator);
  }

  export const jsonStringifyReplacer = (_: string, value: any): any => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
}

export namespace objectUtil {
  export type MergeShapes<U, V> = {
    [k in Exclude<keyof U, keyof V>]: U[k];
  } & V;

  // type optionalKeys<T extends object> = {
  //   [k in keyof T]: undefined extends T[k] ? k : never;
  // }[keyof T];

  type requiredKeys<T extends object> = {
    [k in keyof T]: undefined extends T[k] ? never : k;
  }[keyof T];

  // type alkjsdf = addQuestionMarks<{ a: any }>;

  export type addQuestionMarks<
    T extends object,
    R extends keyof T = requiredKeys<T>
    // O extends keyof T = optionalKeys<T>
  > = Pick<Required<T>, R> & Partial<T>;
  //  = { [k in O]?: T[k] } & { [k in R]: T[k] };

  export type identity<T> = T;
  export type flatten<T> = identity<{ [k in keyof T]: T[k] }>;

  export type noNeverKeys<T> = {
    [k in keyof T]: [T[k]] extends [never] ? never : k;
  }[keyof T];

  export type noNever<T> = identity<{
    [k in noNeverKeys<T>]: k extends keyof T ? T[k] : never;
  }>;

  export const mergeShapes = <U, T>(first: U, second: T): T & U => {
    return {
      ...first,
      ...second, // second overwrites first
    };
  };

  export type extendShape<A, B> = flatten<Omit<A, keyof B> & B>;
}

export const ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set",
]);

export type ZodParsedType = keyof typeof ZodParsedType;

export const getParsedType = (data: any): ZodParsedType => {
  const t = typeof data;

  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;

    case "string":
      return ZodParsedType.string;

    case "number":
      return isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;

    case "boolean":
      return ZodParsedType.boolean;

    case "function":
      return ZodParsedType.function;

    case "bigint":
      return ZodParsedType.bigint;

    case "symbol":
      return ZodParsedType.symbol;

    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (
        data.then &&
        typeof data.then === "function" &&
        data.catch &&
        typeof data.catch === "function"
      ) {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;

    default:
      return ZodParsedType.unknown;
  }
};
