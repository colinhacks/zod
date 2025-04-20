import type * as checks from "./checks.js";
import type { $ZodConfig } from "./core.js";
import type * as errors from "./errors.js";
import type * as schemas from "./schemas.js";

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

// utils
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
export type SomeObject = Record<PropertyKey, any>;
export type Identity<T> = T;
export type Flatten<T> = Identity<{ [k in keyof T]: T[k] }>;
export type Mapped<T> = { [k in keyof T]: T[k] };

export type NoNeverKeys<T> = {
  [k in keyof T]: [T[k]] extends [never] ? never : k;
}[keyof T];
export type NoNever<T> = Identity<{
  [k in NoNeverKeys<T>]: k extends keyof T ? T[k] : never;
}>;
export type Extend<A extends SomeObject, B extends SomeObject> = Flatten<
  // fast path when there is no keys overlap
  keyof A & keyof B extends never
    ? A & B
    : {
        [K in keyof A as K extends keyof B ? never : K]: A[K];
      } & {
        [K in keyof B]: B[K];
      }
>;
// export type Overwrite<A extends SomeObject, B extends SomeObject> = Extend<A, B>;
// export type Extend<A extends schemas.$ZodLooseShape, B extends schemas.$ZodLooseShape> = Extend<A, B>;
export type TupleItems = ReadonlyArray<schemas.$ZodType>;
export type AnyFunc = (...args: any[]) => any;
export type IsProp<T, K extends keyof T> = T[K] extends AnyFunc ? never : K;
export type MaybeAsync<T> = T | Promise<T>;
export type KeyOf<T> = keyof OmitIndexSignature<T>;
export type OmitIndexSignature<T> = {
  [K in keyof T as string extends K ? never : K extends string ? K : never]: T[K];
};
export type ExtractIndexSignature<T> = {
  [K in keyof T as string extends K ? K : K extends string ? never : K]: T[K];
};
export type Keys<T extends object> = keyof OmitIndexSignature<T>;

export type SchemaClass<T extends schemas.$ZodType> = { new (def: T["_zod"]["def"]): T };
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
export type SafeParseError<T> = { success: false; data?: never; error: errors.$ZodError<T> };

export type DiscriminatorMapElement = {
  values: Set<Primitive>;
  maps: DiscriminatorMap[];
};
export type DiscriminatorMap = Map<PropertyKey, DiscriminatorMapElement>;
export type PrimitiveSet = Set<Primitive>;

// functions
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

export function getValidEnumValues(obj: any): any {
  const validKeys = Object.keys(obj).filter((k: any) => typeof obj[obj[k]] !== "number");
  const filtered: any = {};
  for (const k of validKeys) {
    filtered[k] = obj[k];
  }
  return Object.values(filtered);
}

export function joinValues<T extends Primitive[]>(array: T, separator = "|"): string {
  return array.map((val) => stringifyPrimitive(val)).join(separator);
}

export function jsonStringifyReplacer(_: string, value: any): any {
  if (typeof value === "bigint") return value.toString();
  return value;
}

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

export function nullish(input: any): boolean {
  return input === null || input === undefined;
}

export function cleanRegex(source: string): string {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}

export function floatSafeRemainder(val: number, step: number): number {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return (valInt % stepInt) / 10 ** decCount;
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

export function assignProp<T extends object, K extends PropertyKey>(
  target: T,
  prop: K,
  value: K extends keyof T ? T[K] : any
): void {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
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

// zod-specific utils
export function clone<T extends schemas.$ZodType>(inst: T, def: T["_zod"]["def"]): T {
  return new inst._zod.constr(def);
}

export type Params<
  T extends schemas.$ZodType | checks.$ZodCheck,
  IssueTypes extends errors.$ZodIssueBase,
  OmitKeys extends keyof T["_zod"]["def"] = never,
> = Flatten<
  Partial<
    Omit<T["_zod"]["def"], OmitKeys> &
      ([IssueTypes] extends [never]
        ? { error?: never } // unknown
        : {
            error?: string | errors.$ZodErrorMap<IssueTypes> | undefined;
            /** @deprecated This parameter is deprecated. Use `error` instead. */
            message?: string | undefined; // supported in Zod 3
          })
  >
>;

export type TypeParams<
  T extends schemas.$ZodType = schemas.$ZodType & { _isst: never },
  AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "checks" | "error"> = never,
> = Params<T, NonNullable<T["_zod"]["isst"]>, "type" | "checks" | "error" | AlsoOmit>;

// strips types that are not exposed in the public factory
// incl. `error`, `check`
export type CheckParams<
  T extends checks.$ZodCheck = checks.$ZodCheck, // & { _issc: never },
  AlsoOmit extends Exclude<keyof T["_zod"]["def"], "check" | "error"> = never,
> = Params<T, NonNullable<T["_zod"]["issc"]>, "check" | "error" | AlsoOmit>;

// strips types that are not exposed in the public factory
// incl. `type`, `checks`, `error`, `check`, `format`
export type StringFormatParams<
  T extends schemas.$ZodStringFormat = schemas.$ZodStringFormat,
  AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "coerce" | "checks" | "error" | "check" | "format"> = never,
> = Params<
  T,
  NonNullable<T["_zod"]["isst"] | T["_zod"]["issc"]>,
  "type" | "coerce" | "checks" | "error" | "check" | "format" | AlsoOmit
>;

export type CheckStringFormatParams<
  T extends schemas.$ZodStringFormat = schemas.$ZodStringFormat,
  AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "coerce" | "checks" | "error" | "check" | "format"> = never,
> = Params<T, NonNullable<T["_zod"]["issc"]>, "type" | "coerce" | "checks" | "error" | "check" | "format" | AlsoOmit>;

export type CheckTypeParams<
  T extends schemas.$ZodType & checks.$ZodCheck = schemas.$ZodType & checks.$ZodCheck,
  AlsoOmit extends Exclude<keyof T["_zod"]["def"], "type" | "checks" | "error" | "check"> = never,
> = Params<T, NonNullable<T["_zod"]["isst"] | T["_zod"]["issc"]>, "type" | "checks" | "error" | "check" | AlsoOmit>;

export function splitChecksAndParams<T extends TypeParams>(
  _paramsOrChecks?: T | unknown[] | string,
  _checks?: unknown[]
): {
  checks: checks.$ZodCheck<any>[];
  params: T | string;
} {
  const params = (Array.isArray(_paramsOrChecks) ? {} : (_paramsOrChecks ?? {})) as T;
  const checks: any[] = Array.isArray(_paramsOrChecks) ? _paramsOrChecks : (_checks ?? []);
  return {
    checks,
    params,
  };
}

export type Normalize<T> = T extends Record<any, any>
  ? Flatten<
      {
        [k in keyof Omit<T, "error" | "message">]: T[k];
      } & {
        error?: Exclude<T["error"], string>;
        // path?: PropertyKey[] | undefined;
        // message?: string | undefined;
      }
    >
  : never;

export function normalizeParams<T>(_params: T): Normalize<T> {
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

export function optionalObjectKeys(shape: schemas.$ZodShape): string[] {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.qout === "true";
  });
}

export function optionalInterfaceKeys(shape: schemas.$ZodLooseShape): string[] {
  return Object.keys(shape)
    .filter((k) => {
      return k.endsWith("?");
    })
    .map((k) => k.replace(/\?$/, ""));
}

export type CleanInterfaceShape<T extends object> = Identity<{
  [k in keyof T as k extends `${infer K}?` ? K : k extends `?${infer K}` ? K : k]: T[k];
}>;
export type CleanKeys<T extends PropertyKey> = T extends `${infer K}?` ? K : T extends `?${infer K}` ? K : T;
export type OptionalInterfaceKeys<T extends PropertyKey> = T extends `${infer K}?` ? K : never;
export type DefaultedInterfaceKeys<T extends PropertyKey> = T extends `?${infer K}` ? K : never;

export type InitInterfaceParams<T extends schemas.$ZodLooseShape, Extra extends Record<string, unknown>> = Identity<{
  optional: OptionalInterfaceKeys<keyof T>;
  defaulted: DefaultedInterfaceKeys<keyof T>;
  extra: Extra;
}>;

export type MergeOptional<A extends schemas.$ZodInterface, B extends schemas.$ZodInterface> =
  | Exclude<A["_zod"]["optional"], keyof B["_zod"]["def"]["shape"]>
  | B["_zod"]["optional"];
export type MergeDefaulted<A extends schemas.$ZodInterface, B extends schemas.$ZodInterface> =
  | Exclude<A["_zod"]["defaulted"], keyof B["_zod"]["def"]["shape"]>
  | B["_zod"]["defaulted"];

export type MergeInterfaceParams<
  A extends schemas.$ZodInterface,
  B extends schemas.$ZodInterface,
  // BKeys extends PropertyKey,
> = Identity<{
  optional: Exclude<A["_zod"]["optional"], keyof B["_zod"]["def"]["shape"]> | B["_zod"]["optional"];
  defaulted: Exclude<A["_zod"]["defaulted"], keyof B["_zod"]["def"]["shape"]> | B["_zod"]["defaulted"];
  extra: A["_zod"]["extra"];
}>;

export type ExtendInterfaceParams<A extends schemas.$ZodInterface, Shape extends schemas.$ZodLooseShape> = Identity<{
  optional: Exclude<A["_zod"]["optional"], CleanKeys<keyof Shape>> | OptionalInterfaceKeys<keyof Shape>;
  defaulted: Exclude<A["_zod"]["defaulted"], CleanKeys<keyof Shape>> | DefaultedInterfaceKeys<keyof Shape>;
  extra: A["_zod"]["extra"];
}>;
export type ExtendInterfaceShape<A extends schemas.$ZodLooseShape, B extends schemas.$ZodLooseShape> = Extend<
  A,
  CleanInterfaceShape<B>
>;
export type InterfaceParams<T extends schemas.$ZodInterface> = {
  optional: T["_zod"]["optional"];
  defaulted: T["_zod"]["defaulted"];
  extra: T["_zod"]["extra"];
};

export function cleanInterfaceKey(key: string): string {
  return key.replace(/^\?/, "").replace(/\?$/, "");
}

export function cleanInterfaceShape<T extends schemas.$ZodLooseShape>(
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

export const NUMBER_FORMAT_RANGES: Record<checks.$ZodNumberFormats, [number, number]> = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-3.4028234663852886e38, 3.4028234663852886e38],
  float64: [-1.7976931348623157e308, 1.7976931348623157e308],
};

export const BIGINT_FORMAT_RANGES: Record<checks.$ZodBigIntFormats, [bigint, bigint]> = {
  int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")],
};

export function pick(schema: schemas.$ZodObjectLike, mask: object): any {
  const newShape: Writeable<schemas.$ZodShape> = {};
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

  return clone(schema, {
    ...schema._zod.def,
    shape: newShape,
    optional: newOptional,
    checks: [],
  }) as any;
}

export function omit(schema: schemas.$ZodObjectLike, mask: object): any {
  const newShape: Writeable<schemas.$ZodShape> = { ...schema._zod.def.shape };
  const newOptional = new Set(schema._zod.def.optional);
  for (const key in mask) {
    if (!(key in schema._zod.def.shape)) {
      throw new Error(`Unrecognized key: "${key}"`);
    }
    if (!(mask as any)[key]) continue;

    delete newShape[key];
    newOptional.delete(key);
  }
  return clone(schema, {
    ...schema._zod.def,
    shape: newShape,
    optional: [...newOptional],
    checks: [],
  });
}

export function extend(schema: schemas.$ZodObjectLike, shape: schemas.$ZodShape): any {
  const def = {
    ...schema._zod.def,
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    checks: [], // delete existing checks
  } as any;
  defineLazy(def, "shape", () => ({ ...schema._zod.def.shape, ...shape }));
  return clone(schema, def) as any;
}

export function mergeObjectLike(a: schemas.$ZodObjectLike, b: schemas.$ZodObjectLike): any {
  const bKeys = new Set(Object.keys(b._zod.def.shape));
  const optional = [...a._zod.def.optional.filter((k) => !bKeys.has(k)), ...b._zod.def.optional];

  return clone(a, {
    ...a._zod.def,
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
      // return { ...a._zod.def.shape, ...b._zod.def.shape };
    },
    optional,
    catchall: b._zod.def.catchall,
    checks: [], // delete existing checks
  }) as any;
}

export function extendObjectLike(a: schemas.$ZodObjectLike, b: schemas.$ZodObjectLike): any {
  const bKeys = new Set(Object.keys(b._zod.def.shape));
  const optional = [...a._zod.def.optional.filter((k) => !bKeys.has(k)), ...b._zod.def.optional];
  return clone(a, {
    ...a._zod.def,
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
      // return { ...a._zod.def.shape, ...b._zod.def.shape };
    },
    optional,
    checks: [], // delete existent checks
  }) as any;
}

export function partialObjectLike(
  Class: SchemaClass<schemas.$ZodOptional>,
  schema: schemas.$ZodObjectLike,
  mask: object | undefined
): any {
  const shape: Writeable<schemas.$ZodShape> = { ...schema._zod.def.shape };
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

  return clone(schema, {
    ...schema._zod.def,
    shape,
    optional: [...optional],
    checks: [],
  }) as any;
}

export function requiredObjectLike(
  Class: SchemaClass<schemas.$ZodNonOptional>,
  schema: schemas.$ZodObjectLike,
  mask: object | undefined
): any {
  const shape: Writeable<schemas.$ZodShape> = { ...schema._zod.def.shape };

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

  return clone(schema, {
    ...schema._zod.def,
    shape,
    optional: [],
    checks: [],
  }) as any;
}

// add question mark to all non-optional keys
export type PartialInterfaceShape<T extends schemas.$ZodShape, Keys extends string> = Flatten<
  Omit<T, Keys> & {
    [k in Keys as k extends `${string}?` ? k : `${string & k}?`]: T[k];
  }
>;

export type InterfaceKeys<Keys extends string> = string extends Keys
  ? string
  : Keys extends `${infer K}?`
    ? K
    : Keys extends `?${infer K}`
      ? K
      : Keys;

export type Constructor<T, Def extends any[] = any[]> = new (...args: Def) => T;

export function normalizeObjectLikeDef(def: schemas.$ZodObjectLikeDef): {
  shape: Readonly<Record<string, schemas.$ZodType<unknown, unknown>>>;
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

export function aborted(x: schemas.ParsePayload, startIndex = 0): boolean {
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i].continue !== true) return true;
  }
  return false;
}

export function prefixIssues(path: PropertyKey, issues: errors.$ZodRawIssue[]): errors.$ZodRawIssue[] {
  return issues.map((iss) => {
    (iss as any).path ??= [];
    (iss as any).path.unshift(path);
    return iss;
  });
}

export function unwrapMessage(message: string | { message: string } | undefined | null): string | undefined {
  return typeof message === "string" ? message : message?.message;
}

export function finalizeIssue(
  iss: errors.$ZodRawIssue,
  ctx: schemas.ParseContextInternal | undefined,
  config: $ZodConfig
): errors.$ZodIssue {
  const full = { ...iss, path: iss.path ?? [] } as errors.$ZodIssue;
  // for backwards compatibility
  // const _ctx: errors.$ZodErrorMapCtx = { data: iss.input, defaultError: undefined as any };
  if (!iss.message) {
    const message =
      unwrapMessage(iss.inst?._zod.def?.error?.(iss as never)) ??
      unwrapMessage(ctx?.error?.(iss as never)) ??
      unwrapMessage(config.customError?.(iss)) ??
      unwrapMessage(config.localeError?.(iss)) ??
      "Invalid input";
    (full as any).message = message;
  }

  // delete (full as any).def;
  delete (full as any).inst;
  delete (full as any).continue;
  if (!ctx?.reportInput) {
    delete (full as any).input;
  }
  return full;
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
