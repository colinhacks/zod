export namespace util {
  type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <
    V
    >() => V extends U ? 1 : 2
    ? true
    : false;

  export const assertEqual = <A, B>(val: AssertEqual<A, B>) => val;
  export function assertIs<T>(_arg: T): void { }
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
    const obj: { [k in U[number]]: k } = Object.prototype.constructor();
    for (const item of items) {
      obj[item] = item;
    }
    return obj as { [k in U[number]]: k };
  };

  export const getValidEnumValues = (
    obj: Record<string, string | number>): (string | number)[] => {
    const validKeys: string[] = objectKeys(obj).filter(
      (k) => typeof obj[obj[k]] !== "number"
    );
    const filtered: Record<string, string | number> = {}
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return objectValues(filtered);
  };
  
  export const objectValues = (
    (obj: Record<string, string | number>) => {
      return objectKeys(obj).map<string | number>((e, i) => {
        return ({ [i]: obj[e] }[i++]);
      })
    });

  export const objectKeys: {
    (...args: [o: Record<string, unknown>]): string[];
  } = Array.of<string>()
      ? (obj: object | Record<string, unknown>) =>
        Object.entries(obj)
          .map(([x]) => x)
          .map((val) => val)
      : (object: Record<string, any>) => {
        const keys = Array.of<string>();
        for (const key in object) {
          if (
            Object.prototype.hasOwnProperty.call<
              Record<string, any>,
              [string],
              boolean
            >(object, key)
          ) {
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

  export type identity<T> = T;
  export type flatten<T> = identity<{ [k in keyof T]: T[k] }>;
  export type noUndefined<T> = T extends undefined ? never : T;

  export const isInteger: NumberConstructor["isInteger"] =
    typeof Number.isInteger === "function"
      ? (val) => Number.isInteger(val) // eslint-disable-line ban/ban
      : (val) =>
        /// ~~(val: number) === Math.floor(val: number); ~~(val: number) is more performant
        typeof val === "number" && isFinite(val) && ~~(val) === val;

  export function joinValues<T extends any[]>(
    array: T,
    separator = " | "
  ): string {
    return array
      .map((val) => (typeof val === "string" ? `'${val}'` : val))
      .join(separator);
  }
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
