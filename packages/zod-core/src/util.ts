import type * as base from "./base.js";
import type * as errors from "./errors.js";
import type { $ZodStringFormat } from "./schemas.js";

export type Primitive =
  | string
  | number
  | symbol
  | bigint
  | boolean
  | null
  | undefined;

export type Scalars = Primitive | Primitive[];

export type Sizeable = string | Array<unknown> | Set<unknown> | File;

export type Numeric = number | bigint | Date;

export type JWTAlgorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512";

// export type IntegerTypes =
//   | "int8"
//   | "uint8"
//   | "int16"
//   | "uint16"
//   | "int32"
//   | "uint32"
//   | "int64"
//   | "uint64"
//   | "int128"
//   | "uint128";

export type IPVersion = "v4" | "v6";

export type MimeTypes =
  | "application/json"
  | "application/xml"
  | "application/x-www-form-urlencoded"
  | "application/javascript"
  | "application/pdf"
  | "application/zip"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/octet-stream"
  | "application/graphql"
  | "text/html"
  | "text/plain"
  | "text/css"
  | "text/javascript"
  | "text/csv"
  | "image/png"
  | "image/jpeg"
  | "image/gif"
  | "image/svg+xml"
  | "image/webp"
  | "audio/mpeg"
  | "audio/ogg"
  | "audio/wav"
  | "audio/webm"
  | "video/mp4"
  | "video/webm"
  | "video/ogg"
  | "font/woff"
  | "font/woff2"
  | "font/ttf"
  | "font/otf"
  | "multipart/form-data"
  | (string & {});

export type ParsedTypes =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function"
  | "file"
  | "date"
  | "array"
  | "map"
  | "set"
  | "nan"
  | "null"
  | "promise";

/////////////////////////////
///////     UTILS     ///////
/////////////////////////////
export type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <
  V,
>() => V extends U ? 1 : 2
  ? true
  : false;

export type AssertExtends<T, U> = T extends U ? T : never;
export type IsAny<T> = 0 extends 1 & T ? true : false;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;
export type MakePartial<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;
export type Exactly<T, X> = T & Record<Exclude<keyof X, keyof T>, never>;
export type NoUndefined<T> = T extends undefined ? never : T;

// export type OptionalKeys<T extends object> = {
//   [k in keyof T]: undefined extends T[k] ? k : never;
// }[keyof T];
// export type RequiredKeys<T extends object> = {
//   [k in keyof T]: undefined extends T[k] ? never : k;
// }[keyof T];
// export type AddQuestionMarks<T extends object, _O = unknown> = {
//   [K in RequiredKeys<T>]: T[K];
// } & {
//   [K in OptionalKeys<T>]?: T[K];
// } & { [k in keyof T]?: unknown };

export type Identity<T> = T;
export type Flatten<T> = Identity<{ [k in keyof T]: T[k] }>;

export type NoNeverKeys<T> = {
  [k in keyof T]: [T[k]] extends [never] ? never : k;
}[keyof T];

export type NoNever<T> = Identity<{
  [k in NoNeverKeys<T>]: k extends keyof T ? T[k] : never;
}>;

export type ExtendShape<A extends object, B extends object> = {
  [K in keyof A | keyof B]: K extends keyof B
    ? B[K]
    : K extends keyof A
      ? A[K]
      : never;
};

// type UnionToIntersectionFn<T> = (
//   T extends unknown
//     ? (k: () => T) => void
//     : never
// ) extends (k: infer Intersection) => void
//   ? Intersection
//   : never;

// type GetUnionLast<T> = UnionToIntersectionFn<T> extends () => infer Last
//   ? Last
//   : never;

// type UnionToTuple<T, Tuple extends unknown[] = []> = [T] extends [never]
//   ? Tuple
//   : UnionToTuple<Exclude<T, GetUnionLast<T>>, [GetUnionLast<T>, ...Tuple]>;

// type CastToStringTuple<T> = T extends [string, ...string[]] ? T : never;

// export type UnionToTupleString<T> = CastToStringTuple<UnionToTuple<T>>;

export type AnyFunc = (...args: any[]) => any;
export type IsProp<T, K extends keyof T> = T[K] extends AnyFunc ? never : K;
// export type IsMethod<T, K extends keyof T> = T[K] extends AnyFunc ? never : K;
// export type OmitString<T, Pattern extends string> = T extends Pattern
//   ? never
//   : T;
// export type PickProps<T> = { [k in keyof T as IsProp<T, k>]: T[k] };
// export type Def<T extends object> = PickProps<Omit<T, keyof T & `_${string}`>>;

// export type MergeOverrides<
//   Base extends object,
//   Defaults extends Base,
//   Overrides extends Partial<Base>,
// > = {
//   [k in keyof Base]: k extends keyof Overrides
//     ? NoUndefined<Overrides[k]>
//     : Defaults[k];
// };

export type MaybeAsync<T> = T | Promise<T>;

export type OmitIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : K extends string
      ? K
      : never]: T[K];
};

export type ExtractIndexSignature<T> = {
  [K in keyof T as string extends K ? K : K extends string ? never : K]: T[K];
};

export type Keys<T extends object> = keyof OmitIndexSignature<T>;

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

// export function cached<This, T>(
//   th: This,
//   key: string,
//   getter: () => T & ThisType<This>
// ): T {
//   Object.defineProperty(th, key, {
//     get() {
//       const value = getter();
//       Object.defineProperty(th, key, {
//         value,
//         configurable: true,
//       });
//       return value;
//     },
//     configurable: true,
//   });
//   return undefined as any;
// }

// export function makeCache<This, T extends { [k: string]: () => unknown }>(
//   th: This,
//   elements: T & ThisType<This>
// ): { [k in keyof T]: ReturnType<T[k]> } {
//   const cache: { [k: string]: unknown } = {};
//   for (const key in elements) {
//     const getter = elements[key].bind(th);
//     Object.defineProperty(cache, key, {
//       get() {
//         const value = getter();
//         Object.defineProperty(cache, key, {
//           value,
//           configurable: true,
//         });
//         return value;
//       },
//       configurable: true,
//     });
//   }
//   return cache as any;
// }

export function cached<T>(getter: () => T): { value: T } {
  const set = false;
  return {
    get value() {
      if (!set) {
        const _value = getter();
        Object.defineProperty(this, "value", {
          value: _value,
        });
        return _value;
      }
      throw new Error("cached value already set");
    },
  };
  // const cache: { [k: string]: unknown } = {};
}

export function getElementAtPath(
  obj: any,
  path: (string | number)[] | null | undefined
): any {
  if (!path) return obj;
  return path.reduce((acc, key) => acc?.[key], obj);
}

export function promiseAllObject<T extends object>(
  promisesObj: T
): Promise<{ [k in keyof T]: Awaited<T[k]> }> {
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

//////   UTILS   //////
// export type $ZodErrorMap<
//   T extends errors.$ZodIssueBase = errors.$ZodIssueBase,
// > = errors.$ZodErrorMap<T>;

// strips fields that are not exposed in the public factory
// incl. `type`, `checks`, `error`
export type TypeParams<
  T extends base.$ZodType = base.$ZodType,
  AlsoOmit extends keyof T["_def"] = never,
> = Partial<Omit<T["_def"], "type" | "checks" | "error" | AlsoOmit>> & {
  error?: string | T["_def"]["error"] | undefined;
  /** @deprecated This parameter is deprecated. Use `error` instead. */
  message?: string | undefined; // supported in Zod 3
};

// strips types that are not exposed in the public factory
// incl. `error`, `check`
export type CheckParams<
  T extends base.$ZodCheck = base.$ZodCheck,
  AlsoOmit extends keyof T["_def"] = never,
> = Partial<Omit<T["_def"], "check" | "error" | AlsoOmit>> & {
  error?: string | T["_def"]["error"] | undefined;
  /** @deprecated This parameter is deprecated. Use `error` instead. */
  message?: string | undefined; // supported in Zod 3
};

// strips types that are not exposed in the public factory
// incl. `type`, `checks`, `error`, `check`, `format`
export type StringFormatParams<
  T extends $ZodStringFormat = $ZodStringFormat,
  AlsoOmit extends keyof T["_def"] = never,
> = Partial<
  Omit<T["_def"], "type" | "checks" | "error" | "check" | "format" | AlsoOmit>
> & {
  error?: string | T["_def"]["error"] | undefined;
  /** @deprecated This parameter is deprecated. Use `error` instead. */
  message?: string | undefined; // supported in Zod 3
};

export type NormalizedTypeParams<T extends TypeParams = TypeParams> = Omit<
  T,
  "error" | "message"
> & {
  error?: errors.$ZodErrorMap<errors.$ZodIssueBase> | undefined;
  // description?: string | undefined;
};

export function normalizeTypeParams<T extends TypeParams = TypeParams>(
  params?: string | TypeParams
): NormalizedTypeParams<T> {
  if (!params) return {} as any;
  if (typeof params === "string") return { error: () => params } as any;
  const processed: NormalizedTypeParams<T> = {} as any;

  if (params?.message) {
    params.error ??= params.message;
  }
  const { error: _error, description, ...rest } = params;
  if (_error)
    (processed as any).error =
      typeof _error === "string" ? () => _error : _error;
  if (description) processed.description = description;
  Object.assign(processed, rest);
  return processed;
}

export function splitChecksAndParams<T extends TypeParams>(
  _paramsOrChecks?: T | unknown[] | string,
  _checks?: unknown[]
): {
  checks: base.$ZodCheck<any>[];
  params: T;
} {
  if (typeof _paramsOrChecks === "string")
    _paramsOrChecks = { error: _paramsOrChecks } as T;
  const params = (
    Array.isArray(_paramsOrChecks) ? {} : _paramsOrChecks ?? {}
  ) as T;
  const checks: any[] = Array.isArray(_paramsOrChecks)
    ? _paramsOrChecks
    : _checks ?? [];
  return {
    checks,
    params,
  };
}

export type NormalizedCheckParams<T extends CheckParams = CheckParams> = Omit<
  T,
  "error" | "message"
> & {
  error?: errors.$ZodErrorMap;
  path?: PropertyKey[] | undefined;
};

export function normalizeCheckParams<T extends CheckParams = CheckParams>(
  params?: string | CheckParams
): NormalizedCheckParams<T> {
  if (!params) return {} as any;
  if (typeof params === "string") return { error: params } as any;
  if (params?.message) {
    params.error ??= params.message;
  }
  if (typeof params.error === "string")
    return { ...params, error: () => params.error } as any;
  return params as any;
}

export type PrimitiveFactory<
  Params extends TypeParams,
  T extends base.$ZodType,
> = {
  (): T;
  (checks: base.$ZodCheck<base.output<T>>[]): T;
  (error: string): T;
  (params: Partial<Params>, checks?: base.$ZodCheck<base.output<T>>[]): T;
};

export const factory: <
  Cls extends { new (...args: any[]): base.$ZodType },
  Params extends TypeParams,
  // T extends InstanceType<Cls> = InstanceType<Cls>,
>(
  Cls: Cls,
  defaultParams: Omit<
    InstanceType<Cls>["_def"],
    "checks" | "description" | "error"
  >
) => PrimitiveFactory<Params, InstanceType<Cls>> = (Cls, defaultParams) => {
  return (...args: any[]) => {
    const { checks, params } = splitChecksAndParams(...args);
    return new Cls({
      ...defaultParams,
      checks,
      ...normalizeTypeParams(params),
    }) as InstanceType<typeof Cls>;
  };
};

export interface RefinementCtx {
  addIssue(arg: errors.$ZodIssueData | string): void;
}
export type EnumValue = string | number; // | bigint | boolean | symbol;
export type EnumLike = Record<EnumValue, EnumValue>;
export type ToEnum<T extends EnumValue> = { [k in T]: k };
export type KeyOf<T extends object> = ToEnum<Exclude<keyof T, symbol>>;
export type Literal = string | number | bigint | boolean | symbol;
export type LiteralArray = Array<Literal>;

export type SafeParseResult<T> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: base.$ZodError };

export function createTransparentProxy<T extends object>(getter: () => T): T {
  let target: T;
  return new Proxy(
    {},
    {
      get(_, prop, receiver) {
        target ??= getter();
        return Reflect.get(target, prop, receiver);
      },
      set(_, prop, value, receiver) {
        target ??= getter();
        return Reflect.set(target, prop, value, receiver);
      },
      has(_, prop) {
        target ??= getter();
        return Reflect.has(target, prop);
      },
      deleteProperty(_, prop) {
        target ??= getter();
        return Reflect.deleteProperty(target, prop);
      },
      ownKeys(_) {
        target ??= getter();
        return Reflect.ownKeys(target);
      },
      getOwnPropertyDescriptor(_, prop) {
        target ??= getter();
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
      defineProperty(_, prop, descriptor) {
        target ??= getter();
        return Reflect.defineProperty(target, prop, descriptor);
      },
      // apply(target, thisArg, args) {
      //   return Reflect.apply(target, thisArg, args);
      // },
      // construct(target, args, newTarget) {
      //   return Reflect.construct(target, args, newTarget);
      // },
    }
  ) as T;
}
