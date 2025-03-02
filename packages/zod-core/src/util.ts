import type * as base from "./base.js";
import type { $ZodBigIntFormats, $ZodNumberFormats } from "./checks.js";
import type * as errors from "./errors.js";
import type {
  $ZodInterface,
  $ZodInterfaceNamedParams,
  $ZodLooseShape,
  $ZodNonOptional,
  $ZodNonOptionalDef,
  $ZodObjectLike,
  $ZodObjectLikeDef,
  $ZodOptional,
  $ZodOptionalDef,
  $ZodShape,
  $ZodStringFormat,
} from "./schemas.js";

// json
export type JSONType = string | number | boolean | null | JSONType[] | { [key: string]: JSONType };

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
export type AssertEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? true : false;
export type AssertNotEqual<T, U> = (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2 ? false : true;
export type AssertExtends<T, U> = T extends U ? T : never;
export type IsAny<T> = 0 extends 1 & T ? true : false;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;
export type MakePartial<T, K extends keyof T> = Omit<T, K> & InexactPartial<Pick<T, K>>;
export type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type Exactly<T, X> = T & Record<Exclude<keyof X, keyof T>, never>;
export type NoUndefined<T> = T extends undefined ? never : T;
export type Loose<T> = T | {} | undefined | null;
export type Mask<Keys extends PropertyKey> = { [K in string & Keys]?: true };
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type InexactPartial<T> = {
  [P in keyof T]?: T[P] | undefined;
};
export type EmptyObject = Record<string, never>;

// readonly
export type BuiltIn =
  | (((...args: any[]) => any) | (new (...args: any[]) => any))
  | { readonly [Symbol.toStringTag]: string }
  | Date
  | Error
  | Generator
  | Promise<unknown>
  | RegExp;
export type MakeReadonly<T> = T extends Map<infer K, infer V>
  ? ReadonlyMap<K, V>
  : T extends Set<infer V>
    ? ReadonlySet<V>
    : T extends [infer Head, ...infer Tail]
      ? readonly [Head, ...Tail]
      : T extends Array<infer V>
        ? ReadonlyArray<V>
        : T extends BuiltIn
          ? T
          : Readonly<T>;

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

export type SomeObject = Record<PropertyKey, any>;
export type Identity<T> = T;
export type Flatten<T> = Identity<{ [k in keyof T]: T[k] }>;
export type Mapped<T> = { [k in keyof T]: T[k] };
export type Overwrite<T extends SomeObject, U extends SomeObject> = Omit<T, keyof U> & U;

export type NoNeverKeys<T> = {
  [k in keyof T]: [T[k]] extends [never] ? never : k;
}[keyof T];

export type NoNever<T> = Identity<{
  [k in NoNeverKeys<T>]: k extends keyof T ? T[k] : never;
}>;

export type ExtendShape<A extends object, B extends object> = Identity<{
  [K in keyof A | keyof B]: K extends keyof B ? B[K] : K extends keyof A ? A[K] : never;
}>;

export type ExtendObject<A extends $ZodLooseShape, B extends $ZodLooseShape> = Flatten<ExtendShape<A, B>>;

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

export type KeyOf<T> = keyof OmitIndexSignature<T>;

export type OmitIndexSignature<T> = {
  [K in keyof T as string extends K ? never : K extends string ? K : never]: T[K];
};

export type ExtractIndexSignature<T> = {
  [K in keyof T as string extends K ? K : K extends string ? never : K]: T[K];
};

export type Keys<T extends object> = keyof OmitIndexSignature<T>;

export function assertEqual<A, B>(val: AssertEqual<A, B>): AssertEqual<A, B> {
  return val;
}

export function assertNotEqual<A, B>(val: AssertNotEqual<A, B>): AssertNotEqual<A, B> {
  return val;
}

export function assertIs<T>(_arg: T): void {}
export function assertNever(_x: never): never {
  throw new Error();
}
export function assert<T>(_: any): asserts _ is T {}
export function arrayToEnum<T extends string, U extends [T, ...T[]]>(items: U): { [k in U[number]]: k } {
  const obj: any = {};
  for (const item of items) {
    obj[item] = item;
  }
  return obj as any;
}

export function getValidEnumValues(obj: any): any {
  const validKeys = objectKeys(obj).filter((k: any) => typeof obj[obj[k]] !== "number");
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
    : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;

// export function joinValues<T extends any[]>(array: T, separator = " | "): string {
//   return array.map((val) => (typeof val === "string" ? `\"${val}\"` : val)).join(separator);
// }
export function joinValues<T extends Primitive[]>(array: T, separator = "|"): string {
  return array.map((val) => stringifyPrimitive(val)).join(separator);
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
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    },
  };
}

export function defineLazy<T, K extends keyof T>(object: T, key: K, getter: () => T[K]): void {
  const set = false;
  Object.defineProperty(object, key, {
    get() {
      if (!set) {
        const value = getter();
        object[key] = value;
        // Object.defineProperty(object, key, { value });
        return value;
      }
      throw new Error("cached value already set");
    },
    set(v) {
      Object.defineProperty(object, key, {
        value: v,
        // configurable: true,
      });
      // object[key] = v;
    },
    configurable: true,
  });
}

export function getElementAtPath(obj: any, path: (string | number)[] | null | undefined): any {
  if (!path) return obj;
  return path.reduce((acc, key) => acc?.[key], obj);
}

export function promiseAllObject<T extends object>(promisesObj: T): Promise<{ [k in keyof T]: Awaited<T[k]> }> {
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

export function randomString(length = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

export function esc(str: string): string {
  return JSON.stringify(str);
}

export function isObject(data: any): data is Record<PropertyKey, unknown> {
  return typeof data === "object" && data !== null;
}

export const allowsEval: { value: boolean } = cached(() => {
  try {
    new Function("");
    return true;
  } catch (_) {
    return false;
  }
});

export function isPlainObject(data: any): data is Record<PropertyKey, unknown> {
  return typeof data === "object" && data !== null && Object.getPrototypeOf(data) === Object.prototype;
}

export function numKeys(data: any): number {
  let keyCount = 0;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      keyCount++;
    }
  }
  return keyCount;
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
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
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

export const propertyKeyTypes: Set<string> = new Set(["string", "number", "symbol"]);

export const primitiveTypes: Set<string> = new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"]);
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

//////   UTILS   //////
// export type $ZodErrorMap<
//   T extends errors.$ZodIssueBase = errors.$ZodIssueBase,
// > = errors.$ZodErrorMap<T>;

// strips fields that are not exposed in the public factory
// incl. `type`, `checks`, `error`
export type Params<
  T extends base.$ZodType | base.$ZodCheck,
  IssueTypes extends errors.$ZodIssueBase,
  OmitKeys extends keyof T["_zod"]["def"] = never,
  // IssueTypes extends errors.$ZodIssueBase = errors.$ZodIssueBase,
  // Extra
  // AlsoOmit extends Exclude<
  //   keyof T["_zod"]["def"],
  //   "type" | "checks" | "error"
  // > = never,
> = Flatten<
  Partial<
    Omit<T["_zod"]["def"], OmitKeys> &
      ([IssueTypes] extends [never]
        ? unknown
        : {
            error?: string | errors.$ZodErrorMap<IssueTypes> | undefined;
            /** @deprecated This parameter is deprecated. Use `error` instead. */
            message?: string | undefined; // supported in Zod 3
          })
  >
>;

// type lkjasdf = (base.$ZodType & { _isst: never })['']
export type TypeParams<
  T extends base.$ZodType = base.$ZodType & { _isst: never },
  AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "checks" | "error"> = never,
> = Params<T, NonNullable<T["_zod"]["isst"]>, "type" | "checks" | "error" | AlsoOmit>;

// strips types that are not exposed in the public factory
// incl. `error`, `check`
export type CheckParams<
  T extends base.$ZodCheck = base.$ZodCheck, // & { _issc: never },
  AlsoOmit extends Exclude<keyof T["_zod"]["def"], "check" | "error"> = never,
> = Params<T, NonNullable<T["_zod"]["issc"]>, "check" | "error" | AlsoOmit>;

// strips types that are not exposed in the public factory
// incl. `type`, `checks`, `error`, `check`, `format`
export type StringFormatParams<
  T extends $ZodStringFormat = $ZodStringFormat,
  AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "coerce" | "checks" | "error" | "check" | "format"> = never,
> = Params<
  T,
  NonNullable<T["_zod"]["isst"] | T["_zod"]["issc"]>,
  "type" | "coerce" | "checks" | "error" | "check" | "format" | AlsoOmit
>;

export type CheckStringFormatParams<
  T extends $ZodStringFormat = $ZodStringFormat,
  AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "coerce" | "checks" | "error" | "check" | "format"> = never,
> = Params<T, NonNullable<T["_zod"]["issc"]>, "type" | "coerce" | "checks" | "error" | "check" | "format" | AlsoOmit>;

export type CheckTypeParams<
  T extends base.$ZodType & base.$ZodCheck = base.$ZodType & base.$ZodCheck,
  AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "checks" | "error" | "check"> = never,
> = Params<T, NonNullable<T["_zod"]["isst"] | T["_zod"]["issc"]>, "type" | "checks" | "error" | "check" | AlsoOmit>;

// export type NormalizedTypeParams<T extends TypeParams = TypeParams> = Omit<
//   T,
//   "error" | "message"
// > & {
//   error?: errors.$ZodErrorMap<errors.$ZodIssueBase> | undefined;
//   // description?: string | undefined;
// };

export type Def<T extends base.$ZodType = base.$ZodType> = Omit<
  T["_zod"]["def"],
  never
  // "error" | "message"
>;

// export function normalizeTypeArgs<T extends base.$ZodType = base.$ZodType>(
//   __params?: string | TypeParams<T> | base.$ZodCheck<any>[],
//   __checks?: base.$ZodCheck<any>[],
//   __defaults?: Partial<T["_zod"]["def"]>
// ): Def<T> {
//   const params = (Array.isArray(__params)
//     ? {}
//     : typeof __params === "string"
//       ? { error: () => __params }
//       : {}) as any as TypeParams<T>;
//   Object.assign(params, __defaults);
//   const checks = (
//     Array.isArray(__params) ? __params : __checks ?? []
//   ) as base.$ZodCheck<any>[];

//   if (params.message) {
//     params.error ??= () => params.message;
//     delete params.message;
//   }

//   const _error = params.error;
//   if (_error) params.error = typeof _error === "string" ? () => _error : _error;

//   const final: Def<T> = {} as any;
//   Object.assign(final, __defaults);
//   Object.assign(final, params);
//   final.checks = checks;
//   return final;
// }

// type kljadf = TypeParams;
// type lk = kljadf
export function splitChecksAndParams<T extends TypeParams>(
  _paramsOrChecks?: T | unknown[] | string,
  _checks?: unknown[]
): {
  checks: base.$ZodCheck<any>[];
  params: T | string;
} {
  const params = (Array.isArray(_paramsOrChecks) ? {} : (_paramsOrChecks ?? {})) as T;
  const checks: any[] = Array.isArray(_paramsOrChecks) ? _paramsOrChecks : (_checks ?? []);
  return {
    checks,
    params,
  };
}

export function normalizeTypeParams<T extends TypeParams = TypeParams<base.$ZodType>>(params?: any): Normalize<T> {
  if (!params) return {} as any;
  if (typeof params === "string") return { error: () => params } as any;
  const processed: Normalize<T> = {} as any;

  if (params?.message !== undefined) {
    params.error ??= params.message;
  }
  const { error: _error, description, ...rest } = params;
  if (_error) (processed as any).error = typeof _error === "string" ? () => _error : _error;
  // if (description) processed.description = description;
  Object.assign(processed, rest);
  return processed;
}

export type Normalize<T> = T extends Record<any, any>
  ? Flatten<
      {
        [k in Exclude<keyof T, "error" | "message">]: T[k];
      } & {
        error?: Exclude<T["error"], string>;
        // path?: PropertyKey[] | undefined;
        // message?: string | undefined;
      }
    >
  : never;

export function normalizeCheckParams<T>(_params: T): Normalize<T> {
  const params: any = _params;

  if (!params) return {} as any;
  if (typeof params === "string") return { error: () => params } as any;
  if (params?.message !== undefined) {
    if (params?.error !== undefined) throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string") return { ...params, error: () => params.error } as any;
  return params as any;
}

// export type PrimitiveFactory<
//   Params extends TypeParams,
//   T extends base.$ZodType,
// > = {
//   (checks: base.$ZodCheck<base.output<T>>[]): T;
//   (
//     params?: string | Partial<Params>,
//     checks?: base.$ZodCheck<base.output<T>>[]
//   ): T;
// };

// export const factory: <
//   Cls extends { new (...args: any[]): base.$ZodType },
//   Params extends TypeParams,
//   // T extends InstanceType<Cls> = InstanceType<Cls>,
// >(
//   Cls: Cls,
//   defaultParams: Omit<
//     InstanceType<Cls>["_zod"]["def"],
//     "checks" | "description" | "error"
//   >
// ) => PrimitiveFactory<Params, InstanceType<Cls>> = (Cls, defaultParams) => {
//   return (...args: any[]) => {
//     const { checks, params } = splitChecksAndParams(...args);
//     return new Cls({
//       ...defaultParams,
//       checks,
//       ...normalizeTypeParams(params),
//     }) as InstanceType<typeof Cls>;
//   };
// };
type ClassType<T> = { new (...args: any[]): T };
export const factory =
  <Cls extends ClassType<base.$ZodType>>(
    _class: () => Cls,
    _defaults: Omit<InstanceType<Cls>["_zod"]["def"], "checks" | "error">
  ) =>
  (...args: any[]): InstanceType<Cls> => {
    const { checks, params } = splitChecksAndParams(...args);
    const finalParams = {
      ..._defaults,
      checks,
      ...normalizeTypeParams(params),
    };

    return new (_class())(finalParams) as any;
  };

export type FactoryParams<T extends base._$ZodTypeDef, Omitted extends keyof T, Optionals extends keyof T> = Flatten<
  Omit<T, "error" | "checks" | Omitted | Optionals> &
    Partial<{ [k in Optionals]: T[k] }> & {
      error?: string | T["error"] | undefined;
      /** @deprecated This parameter is deprecated. Use `error` instead. */
      message?: string | undefined;
    }
>;

export const makeFactory =
  <Class extends ClassType<base.$ZodType>>(_class: Class) =>
  <
    Fixed extends Partial<InstanceType<Class>["_zod"]["def"]>,
    Defaults extends Partial<InstanceType<Class>["_zod"]["def"]>,
  >(
    fixed: Fixed,
    defaults: Defaults
  ): Factory<InstanceType<Class>, Fixed, Defaults> => {
    return new Factory<InstanceType<Class>, Fixed, Defaults>(_class as any, fixed, defaults);
  };

export class Factory<
  Class extends base.$ZodType,
  Fixed extends Partial<Class["_zod"]["def"]>,
  Defaults extends Partial<Class["_zod"]["def"]>,
> {
  _class: ClassType<Class>;
  _fixed: Fixed;
  _default: Defaults;
  Params!: FactoryParams<
    Class["_zod"]["def"],
    keyof Class["_zod"]["def"] & keyof Fixed,
    keyof Class["_zod"]["def"] & keyof Defaults
  >;

  constructor(_class: ClassType<Class>, fixed: Fixed, defaults: Defaults) {
    this._class = _class;
    this._fixed = fixed;
    this._default = defaults;
  }

  init(...params: any[]): Class {
    const { checks, params: _params } = splitChecksAndParams(...params);
    return new this._class({
      ...this._fixed,
      ...this._default,
      checks,
      ...normalizeTypeParams(_params),
    });
  }
}

export type EnumValue = string | number; // | bigint | boolean | symbol;
export type EnumLike = Readonly<Record<string, EnumValue>>;
export type ToEnum<T extends EnumValue> = Flatten<{ [k in T]: k }>;
export type KeysEnum<T extends object> = ToEnum<Exclude<keyof T, symbol>>;
export type KeysArray<T extends object> = Flatten<(keyof T & string)[]>;
export type Literal = string | number | bigint | boolean | null | undefined;
export type LiteralArray = Array<Literal>;
export type Primitive = string | number | symbol | bigint | boolean | null | undefined;
export type PrimitiveArray = Array<Primitive>;
export type HasSize = { size: number };
export type HasLength = { length: number }; // string | Array<unknown> | Set<unknown> | File;
export type Numeric = number | bigint | Date;

export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseError<T>;
export type SafeParseSuccess<T> = { success: true; data: T; error?: never };
export type SafeParseError<T> = { success: false; data?: never; error: base.$ZodError<T> };

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

export function stringifyPrimitive(value: any): string {
  if (typeof value === "bigint") return value.toString() + "n";
  if (typeof value === "string") return `"${value}"`;
  return `${value}`;
}

// export function removeReverse
export type MethodParams<Err extends errors.$ZodIssueBase, Extra = unknown> =
  | string
  | ({
      error?: string | errors.$ZodErrorMap<Err> | undefined;
      /** @deprecated This parameter is deprecated. Use `error` instead. */
      message?: string;
    } & Extra);

export function optionalObjectKeys(shape: $ZodShape): string[] {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.qout === "true";
  });
}

export function optionalInterfaceKeys(shape: $ZodLooseShape): string[] {
  return Object.keys(shape)
    .filter((k) => {
      return k.endsWith("?");
    })
    .map((k) => k.replace(/\?$/, ""));
}

// export type CleanInterfaceShape<T extends object> = Flatten<
//   {
//     [k in keyof T as k extends `${infer K}?` ? K : never]?: T[k];
//   } & {
//     [k in Exclude<keyof T, `${string}?`> as k extends `?${infer K}` ? K : k]: T[k];
//   }
// >;
export type CleanInterfaceShape<T extends object> = Identity<{
  [k in keyof T as k extends `${infer K}?` ? K : k extends `?${infer K}` ? K : k]: T[k];
}>;
export type CleanKeys<T extends PropertyKey> = T extends `${infer K}?` ? K : T extends `?${infer K}` ? K : T;
export type OptionalInterfaceKeys<T extends PropertyKey> = T extends `${infer K}?` ? K : never;
export type DefaultedInterfaceKeys<T extends PropertyKey> = T extends `?${infer K}` ? K : never;

export type InitInterfaceParams<T extends $ZodLooseShape, Extra extends Record<string, unknown>> = Identity<{
  optional: OptionalInterfaceKeys<keyof T>;
  defaulted: DefaultedInterfaceKeys<keyof T>;
  extra: Extra;
}>;

export type MergeInterfaceParams<
  A extends $ZodInterface,
  B extends $ZodInterface,
  // BKeys extends PropertyKey,
> = Identity<{
  optional: Exclude<A["_zod"]["optional"], keyof B["_zod"]["shape"]> | B["_zod"]["optional"];
  defaulted: Exclude<A["_zod"]["defaulted"], keyof B["_zod"]["shape"]> | B["_zod"]["defaulted"];
  extra: A["_zod"]["extra"];
}>;

export type ExtendInterfaceParams<A extends $ZodInterface, Shape extends $ZodLooseShape> = Identity<{
  optional: Exclude<A["_zod"]["optional"], CleanKeys<keyof Shape>> | OptionalInterfaceKeys<keyof Shape>;
  defaulted: Exclude<A["_zod"]["defaulted"], CleanKeys<keyof Shape>> | DefaultedInterfaceKeys<keyof Shape>;
  extra: A["_zod"]["extra"];
}>;
export type ExtendInterfaceShape<A extends $ZodLooseShape, B extends $ZodLooseShape> = ExtendShape<
  A,
  CleanInterfaceShape<B>
>;
export type InterfaceParams<T extends $ZodInterface> = {
  optional: T["_zod"]["optional"];
  defaulted: T["_zod"]["defaulted"];
  extra: T["_zod"]["extra"];
};

export type CleanKeysMap<T extends object> = {
  [k in keyof T as CleanKeys<k>]: k;
};
export type ReconstructShape<T extends $ZodLooseShape, Params extends $ZodInterfaceNamedParams> = Identity<{
  [k in keyof T as k extends Params["defaulted"] ? `?${k}` : k extends Params["optional"] ? `${k}?` : k]: T[k];
}>;

export function shape<T extends $ZodInterface>(
  schema: T
): ReconstructShape<
  T["_zod"]["shape"],
  {
    optional: T["_zod"]["optional"];
    defaulted: T["_zod"]["defaulted"];
    extra: T["_zod"]["extra"];
  }
> {
  const reconstructed: any = {};
  for (const key in schema._zod.shape) {
    const value = schema._zod.shape[key];
    if (schema._zod.def.optional.includes(key)) {
      reconstructed[`${key}?`] = value;
    } else if (schema._zod.defaulted.includes(key)) {
      reconstructed[`?${key}`] = value;
    } else {
      reconstructed[key] = value;
    }
  }
  return schema._zod.def.shape as any;
}

export function cleanInterfaceKey(key: string): string {
  return key.replace(/^\?/, "").replace(/\?$/, "");
}

export function cleanInterfaceShape<T extends $ZodLooseShape>(
  _shape: T
): {
  shape: CleanInterfaceShape<T>;
  keyMap: Record<string, string>;
  optional: string[];
  defaulted: string[];
} {
  const keyMap: Record<string, string> = {};
  const shape = {} as CleanInterfaceShape<T>;
  const optional: string[] = [];
  const defaulted: string[] = [];

  for (const [key, value] of Object.entries(_shape)) {
    if (key.endsWith("?")) optional.push(key.slice(0, -1));
    if (key.startsWith("?")) defaulted.push(key.slice(1));
    const cleanKey = cleanInterfaceKey(key);
    (shape as any)[cleanKey] = value;
    keyMap[cleanKey] = key;
  }

  return { shape, keyMap, optional, defaulted };
}

export const NUMBER_FORMAT_RANGES: Record<$ZodNumberFormats, [number, number]> = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-3.4028234663852886e38, 3.4028234663852886e38],
  float64: [-1.7976931348623157e308, 1.7976931348623157e308],
};

export const BIGINT_FORMAT_RANGES: Record<$ZodBigIntFormats, [bigint, bigint]> = {
  int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")],
  uint64: [BigInt(0), BigInt("18446744073709551615")],
};

export function pick(schema: $ZodObjectLike, mask: object) {
  const newShape: Writeable<$ZodShape> = {};
  const newOptional: string[] = [];
  const currShape = schema._zod.def.shape;
  const currOptional = new Set(schema._zod.def.optional);
  // const currDefaulted = new Set(schema._zod.def.defaulted);

  for (const key in mask) {
    if (!(key in currShape)) {
      throw new Error(`Unrecognized key: "${key}"`);
    }
    if (!(mask as any)[key]) continue;

    // pick key
    newShape[key] = currShape[key];
    if (currOptional.has(key)) {
      newOptional.push(key);
    }
  }

  return schema.$clone({
    ...schema._zod.def,
    shape: newShape,
    optional: newOptional,
    checks: [],
  }) as any;
}

export function omit(schema: $ZodObjectLike, mask: object) {
  const newShape: Writeable<$ZodShape> = { ...schema._zod.def.shape };
  const newOptional = new Set(schema._zod.def.optional);
  for (const key in mask) {
    if (!(key in schema._zod.def.shape)) {
      throw new Error(`Unrecognized key: "${key}"`);
    }
    if (!(mask as any)[key]) continue;

    delete newShape[key];
    newOptional.delete(key);
  }
  return schema.$clone({
    ...schema._zod.def,
    shape: newShape,
    optional: [...newOptional],
    checks: [],
  }) as any;
}

export function extend(schema: $ZodObjectLike, shape: $ZodShape): any {
  return schema.$clone({
    ...schema._zod.def,
    get shape() {
      return { ...schema._zod.def.shape, ...shape };
    },

    checks: [], // delete existing checks
  }) as any;
}

export function mergeObjectLike(a: $ZodObjectLike, b: $ZodObjectLike): any {
  const bKeys = new Set(Object.keys(b._zod.def.shape));
  const optional = [...a._zod.def.optional.filter((k) => !bKeys.has(k)), ...b._zod.def.optional];

  return a.$clone({
    ...a._zod.def,
    get shape() {
      return { ...a._zod.def.shape, ...b._zod.def.shape };
    },
    optional,
    catchall: b._zod.def.catchall,
    checks: [], // delete existing checks
  }) as any;
}

export function extendObjectLike(a: $ZodObjectLike, b: $ZodObjectLike): any {
  const bKeys = new Set(Object.keys(b._zod.def.shape));
  const optional = [...a._zod.def.optional.filter((k) => !bKeys.has(k)), ...b._zod.def.optional];
  return a.$clone({
    ...a._zod.def,
    get shape() {
      return { ...a._zod.def.shape, ...b._zod.def.shape };
    },
    optional,
    checks: [], // delete existing checks
  }) as any;
}

export function partialObjectLike(
  schema: $ZodObjectLike,
  mask: object | undefined,
  Class: new (def: $ZodOptionalDef<any>) => $ZodOptional
): any {
  const shape: Writeable<$ZodShape> = { ...schema._zod.def.shape };
  const optional: Set<string> = new Set(schema._zod.def.optional);

  if (mask) {
    for (const key in mask) {
      if (!(key in shape)) {
        throw new Error(`Unrecognized key: "${key}"`);
      }
      if (!(mask as any)[key]) continue;
      shape[key] = new Class({
        type: "optional",
        innerType: schema._zod.def.shape[key],
      });
      optional.add(key);
    }
  } else {
    for (const key in schema._zod.def.shape) {
      shape[key] = new Class({
        type: "optional",
        innerType: schema._zod.def.shape[key],
      });
      optional.add(key);
    }
  }

  return schema.$clone({
    ...schema._zod.def,
    shape,
    optional: [...optional],
    checks: [],
  }) as any;
}

export function requiredObjectLike(
  schema: $ZodObjectLike,
  mask: object | undefined,
  Class: new (def: $ZodNonOptionalDef<any>) => $ZodNonOptional
): any {
  const shape: Writeable<$ZodShape> = { ...schema._zod.def.shape };

  if (mask) {
    for (const key in mask) {
      if (!(key in shape)) {
        throw new Error(`Unrecognized key: "${key}"`);
      }
      if (!(mask as any)[key]) continue;
      // overwrite with non-optional
      shape[key] = new Class({
        type: "nonoptional",
        innerType: schema._zod.def.shape[key],
      });
    }
  } else {
    for (const key in schema._zod.def.shape) {
      // overwrite with non-optional
      shape[key] = new Class({
        type: "nonoptional",
        innerType: schema._zod.def.shape[key],
      });
    }
  }

  return schema.$clone({
    ...schema._zod.def,
    shape,
    optional: [],
    checks: [],
  }) as any;
}

// add question mark to all non-optional keys
export type PartialInterfaceShape<T extends $ZodShape, Keys extends string> = Flatten<
  Omit<T, Keys> & {
    [k in Keys as k extends `${string}?` ? k : `${string & k}?`]: T[k];
  }
>;

// export function partialInterface(
//   schema: $ZodInterface,
//   mask: object | undefined,
//   Class: new (def: $ZodOptionalDef<any>) => $ZodOptional
// ): any {
//   const shape: Writeable<$ZodShape> = { ...schema._zod.def.shape };
//   const optional: string[] = Object.keys(schema._zod.def.shape);
//   for (const key in schema._zod.def.shape) {
//     if (mask && key in mask) {
//       shape[key] = new Class({
//         type: "optional",
//         innerType: schema._zod.def.shape[key],
//       });
//     } else {
//       shape[key] = new Class({
//         type: "optional",
//         innerType: schema._zod.def.shape[key],
//       });
//     }
//   }
//   return schema.$clone({
//     ...schema._zod.def,
//     shape,
//     optional,
//     checks: [],
//   }) as any;
// }

// export type RequiredInterfaceShape<T extends $ZodShape, Keys extends string = string & keyof T> = Flatten<
//   Omit<T, Keys> & {
//     [k in Keys as k extends `${infer NewK}?` ? NewK : k extends `?${infer NewK}` ? NewK : k]: T[k];
//   }
// >;

// export function requiredInterface(
//   schema: $ZodInterface,
//   mask: object | undefined,
//   Class: new (def: $ZodNonOptionalDef<any>) => $ZodNonOptional
// ): any {
// const shape: Record<string, base.$ZodType> = { ...schema._zod.def.shape };
// for (const key in schema._zod.def.shape) {
//   if (mask && !(key in mask)) continue;
//   if (key[key.length - 1] === "?") {
//     delete shape[key];
//     shape[key.slice(0, -1)] = schema._zod.def.shape[key];
//   } else if (key[0] === "?") {
//     delete shape[key];
//     shape[key.slice(1)] = schema._zod.def.shape[key];
//   } else {
//     // do nothing, key is already required
//   }
// }
// return schema.$clone({
//   ...schema._zod.def,
//   shape,
//   checks: [],
// });
// }
//
export type InterfaceKeys<Keys extends string> = string extends Keys
  ? string
  : Keys extends `${infer K}?`
    ? K
    : Keys extends `?${infer K}`
      ? K
      : Keys;

export type Constructor<T, Def extends any[] = any[]> = new (...args: Def) => T;

export function floatSafeRemainder(val: number, step: number): number {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return (valInt % stepInt) / 10 ** decCount;
}

export function normalizeObjectLikeDef(def: $ZodObjectLikeDef): {
  shape: Readonly<Record<string, base.$ZodType<unknown, unknown>>>;
  // keyMap: Record<string, string>;
  keys: string[];
  keySet: Set<string>;
  numKeys: number;
  optionalKeys: Set<string>;
} {
  if (def.type === "interface") {
    const keys = Object.keys(def.shape);
    const keySet = new Set(Object.keys(def.shape));

    return {
      shape: { ...def.shape }, // resolve getters
      keys,
      keySet,
      numKeys: keys.length,
      optionalKeys: new Set(def.optional),
    };
  }
  if (def.type === "object") {
    const keys = Object.keys(def.shape);
    const keySet: Set<string> = new Set(Object.keys(def.shape));

    return {
      shape: { ...def.shape }, // resolve getters
      keys,
      keySet,
      numKeys: keys.length,
      optionalKeys: new Set(def.optional),
    };
  }
  throw new Error("Invalid object-like type");
}

export function aborted(x: base.$ParsePayload, startIndex = 0): boolean {
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i].continue !== true) return true;
  }
  return false;
}

export function prefixIssues(path: PropertyKey, issues: errors.$ZodRawIssue[]): errors.$ZodRawIssue[] {
  return issues.map((iss) => {
    iss.path ??= [];
    iss.path.unshift(path);
    return iss;
  });
}

export function getSizableOrigin(input: any): "set" | "map" | "file" | "unknown" {
  if (input instanceof Set) return "set";
  if (input instanceof Map) return "map";
  if (input instanceof File) return "file";
  return "unknown";
}

export function getLengthableOrigin(input: any): "array" | "string" | "unknown" {
  if (Array.isArray(input)) return "array";
  if (typeof input === "string") return "string";
  return "unknown";
}

//////////    REFINES     //////////
export function issue(_iss: string, input: any, inst: any): errors.$ZodRawIssue;
export function issue(_iss: errors.$ZodRawIssue): errors.$ZodRawIssue;
export function issue(...args: [string | errors.$ZodRawIssue, any?, any?]): errors.$ZodRawIssue {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst,
    };
  }

  return { ...iss };
}

export function nullish(input: any): boolean {
  return input === null || input === undefined;
}

export function cleanRegex(source: string): string {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
