import type * as checks from "./checks.js";
import { globalConfig } from "./core.js";
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
  | "PS512"
  | "EdDSA"
  | (string & {});

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha384" | "sha512";
export type HashEncoding = "hex" | "base64" | "base64url";
export type HashFormat = `${HashAlgorithm}_${HashEncoding}`;
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
type ToZodMismatch<T, S extends schemas.$ZodType> = {
  "types do not match": {
    expected: T;
    received: S["_zod"]["output"];
  };
};

// Stays a `$ZodType` so it still satisfies the shape constraint, and carries a brand no real schema has so the offending property is the one TypeScript reports as unassignable.
type ToZodKeyMismatch<Expected, Received> = schemas.$ZodType & {
  "types do not match": { expected: Expected; received: Received };
};

// An enum reference and the union of exactly its members are mutually assignable but not identical, so `AssertEqual` alone rejects `z.enum(SomeEnum)` against a `SomeEnum` target. Unioning each side with a private dummy forces the union to be rebuilt, which collapses that one difference and nothing else — plain literals against an enum, member subsets, brands and `any` all still fail. The symbol is not exported, so no user type can smuggle it in and cancel a real difference.
declare const toZodDummy: unique symbol;

// Homomorphic, so `readonly` and optional modifiers survive the rebuild and only leaves are normalized. An intersection flattens here, which is why an intersection target and the flat object with the same keys match each other. A callable stops the walk because `keyof` a function is `never`, so mapping one would erase its signature and make every function compare equal.
type ToZodNormalize<T> = [T] extends [(...args: any[]) => any]
  ? T
  : [T] extends [object]
    ? { [K in keyof T]: ToZodNormalize<T[K]> }
    : T | typeof toZodDummy;

type ToZodEqual<Output, T> = AssertEqual<Output, T> extends true
  ? true
  : IsAny<Output> extends true
    ? false
    : IsAny<T> extends true
      ? false
      : AssertEqual<ToZodNormalize<Output>, ToZodNormalize<T>>;

// Rebuilds the shape with a marker on each key that disagrees, so the diagnostic names the key instead of failing the whole schema at the top level. A key the target lacks reports `expected: never`; a key the schema lacks reports `received: never`.
type ToZodShape<Shape, T> = {
  [K in keyof Shape]: Shape[K] extends schemas.$ZodType
    ? K extends keyof T
      ? ToZodEqual<Shape[K]["_zod"]["output"], T[K]> extends true
        ? Shape[K]
        : ToZodKeyMismatch<T[K], Shape[K]["_zod"]["output"]>
      : ToZodKeyMismatch<never, Shape[K]["_zod"]["output"]>
    : Shape[K];
} & { [K in Exclude<keyof T, keyof Shape>]: ToZodKeyMismatch<T[K], never> };

// Forces the mapped type to display expanded, so the error prints the keys rather than the alias name.
type ToZodExpand<X> = { [K in keyof X]: X[K] } & {};

// Only localizes when a key is genuinely at fault. A whole-type difference the per-key walk cannot see — a `readonly` modifier, an intersection versus the flat object with the same keys — leaves every key agreeing, and reporting nothing there would silently accept what the top-level check rejected.
type ToZodTarget<S extends schemas.$ZodType, T> = S extends schemas.$ZodObject<infer Shape, infer Config>
  ? T extends object
    ? AssertEqual<ToZodExpand<ToZodShape<Shape, T>>, ToZodExpand<Shape>> extends true
      ? S & ToZodMismatch<T, S>
      : schemas.$ZodObject<ToZodExpand<ToZodShape<Shape, T>>, Config>
    : S & ToZodMismatch<T, S>
  : S & ToZodMismatch<T, S>;
export type IsAny<T> = 0 extends 1 & T ? true : false;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;
export type MakePartial<T, K extends keyof T> = Omit<T, K> & InexactPartial<Pick<T, K>>;
export type MakeRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type Exactly<T, X> = T & Record<Exclude<keyof X, keyof T>, never>;
export type NoUndefined<T> = T extends undefined ? never : T;
export type Whatever = {} | undefined | null;
// literal inputs widen to their primitive so a property check over `"https:"` accepts a `string` property
export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends bigint
        ? bigint
        : T;

export type LoosePartial<T extends object> = InexactPartial<T> & {
  [k: string]: unknown;
};
export type Mask<Keys extends PropertyKey> = { [K in Keys]?: true };
export type Writeable<T> = { -readonly [P in keyof T]: T[P] } & {};
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
export type Prettify<T> = {
  // @ts-ignore
  [K in keyof T]: T[K];
} & {};

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

export type TupleItems = ReadonlyArray<schemas.SomeType>;
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

export type SchemaClass<T extends schemas.SomeType> = {
  new (def: T["_zod"]["def"]): T;
};
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
export type SafeParseError<T> = {
  success: false;
  data?: never;
  error: errors.$ZodError<T>;
};

export type PropValues = Record<string, Set<Primitive>>;
export type PrimitiveSet = Set<Primitive>;

// functions
export function assertEqual<A, B>(val: AssertEqual<A, B>): AssertEqual<A, B> {
  return val;
}

export function assertNotEqual<A, B>(val: AssertNotEqual<A, B>): AssertNotEqual<A, B> {
  return val;
}

export function toZod<T>(): <S extends schemas.$ZodType>(
  schema: ToZodEqual<S["_zod"]["output"], T> extends true ? S : ToZodTarget<S, T>
) => S {
  return (schema) => schema as any;
}

export function assertIs<T>(_arg: T): void {}

export function assertNever(_x: never): never {
  throw new Error("Unexpected value in exhaustive check");
}
export function assert<T>(_: any): asserts _ is T {}

export function getEnumValues(entries: EnumLike): EnumValue[] {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries)
    .filter(([k, _]) => numericValues.indexOf(+k) === -1)
    .map(([_, v]) => v);
  return values;
}

export function joinValues<T extends Primitive[]>(array: T, separator = "|"): string {
  return array.map((val) => stringifyPrimitive(val)).join(separator);
}

export function jsonStringifyReplacer(_: string, value: any): any {
  if (typeof value === "bigint") return value.toString();
  return value;
}

// the accessor lives on a shared prototype: an own accessor makes every box a dictionary-mode object (~360 B and a slow load per read against ~100 B and an inlined getter here)
class Cached<T> {
  _getter: (() => T) | undefined;
  _value: T | undefined;

  constructor(getter: () => T) {
    this._getter = getter;
    this._value = undefined;
  }

  get value(): T {
    const getter = this._getter;
    if (getter !== undefined) {
      this._value = getter();
      this._getter = undefined;
    }
    return this._value as T;
  }
}

export function cached<T>(getter: () => T): { value: T } {
  return new Cached(getter);
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
  const ratio = val / step;
  const roundedRatio = Math.round(ratio);
  // `val` and `step` each round to a double before the division rounds again, so a true decimal multiple's quotient can sit up to 1.5 of these scaled epsilons from the integer. A 1x tolerance therefore rejected 2.03 as a multiple of 0.07; 4x covers the worst case with margin.
  const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
  if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
  return ratio - roundedRatio;
}

const EVALUATING = /* @__PURE__*/ Symbol("evaluating");

export function defineLazy<T, K extends keyof T>(object: T, key: K, getter: () => T[K]): void {
  let value: T[K] | typeof EVALUATING | undefined = undefined;
  Object.defineProperty(object, key, {
    get() {
      if (value === EVALUATING) {
        // Circular reference detected, return undefined to break the cycle
        return undefined as T[K];
      }
      if (value === undefined) {
        value = EVALUATING;
        value = getter();
      }
      return value;
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

export function objectClone(obj: object) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
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

/** A def's `shape` accessor, carrying whichever object it currently answers from. */
export interface ShapeGetter {
  (): Record<PropertyKey, any>;
  raw: Record<PropertyKey, any>;
}

/**
 * Whichever object a def's `shape` currently answers from: the one the caller passed until the first read, the frozen copy after it.
 *
 * Its keys and descriptors read without invoking anything, which is what lets a discriminated union check its discriminator, and the cycle walk read a shape, without resolving a getter that references the schema being constructed. A def that answers `shape` from an accessor of its own has none.
 */
export function rawShape(def: any): Record<PropertyKey, any> | undefined {
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  return desc?.get ? (desc.get as ShapeGetter).raw : desc?.value;
}

// where a builder reads its source's keys and descriptors, resolving only a shape a def answers for itself. A shape resolves by object spread, so only its enumerable keys are ever part of it.
function sourceShape(schema: schemas.$ZodObject): Record<PropertyKey, any> {
  return rawShape(schema._zod.def) ?? (schema._zod.def.shape as any);
}

// a key whose value is not settled yet, self-caching so every read after the first gets the same one
function deferProp(target: object, key: PropertyKey, getter: () => any): void {
  Object.defineProperty(target, key, {
    get(this: any) {
      const value = getter();
      assignProp(this, key as any, value);
      return value;
    },
    enumerable: true,
    configurable: true,
  });
}

// Writes a settled key. A plain assignment is much cheaper than `defineProperty` and produces the same descriptor, but it runs whatever setter already answers to the key — an accessor this shape deferred, or an inherited one, which `__proto__` has on every object and prototype pollution can add for any name.
function putProp(target: any, key: PropertyKey, value: any): void {
  if (key in target) assignProp(target, key as any, value);
  else target[key] = value;
}

/**
 * Copies `keys` of `source`'s shape onto `target`, each value passed through `wrap`.
 *
 * A key the source has resolved is copied through now, so the derived shape states it outright and nothing has to resolve it to learn what it holds. A key the source still defers stays deferred, and reads back through the source's own `shape`, so it resolves once and both shapes get that one schema.
 */
function mirrorShape(
  target: object,
  source: schemas.$ZodObject,
  keys: PropertyKey[],
  wrap?: ((value: any, key: PropertyKey) => any) | null
): void {
  const raw = sourceShape(source);
  for (const key of keys) {
    const desc = Object.getOwnPropertyDescriptor(raw, key)!;
    if (!desc.enumerable) continue;
    if (desc.get) {
      deferProp(target, key, () => {
        const value = (source._zod.def.shape as any)[key];
        return wrap ? wrap(value, key) : value;
      });
    } else putProp(target, key, wrap ? wrap(desc.value, key) : desc.value);
  }
}

// same, for a plain shape a caller passed rather than a schema's
function mirrorProps(target: object, source: Record<PropertyKey, any>): void {
  for (const key of Reflect.ownKeys(source)) {
    const desc = Object.getOwnPropertyDescriptor(source, key)!;
    if (!desc.enumerable) continue;
    if (desc.get) deferProp(target, key, () => source[key as any]);
    else putProp(target, key, desc.value);
  }
}

export function mergeDefs(...defs: Record<string, any>[]): any {
  const mergedDescriptors: Record<string, PropertyDescriptor> = {};

  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }

  return Object.defineProperties({}, mergedDescriptors);
}

export function cloneDef(schema: schemas.$ZodType): any {
  return mergeDefs(schema._zod.def);
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
      resolvedObj[keys[i]!] = results[i];
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

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const captureStackTrace: (targetObject: object, constructorOpt?: Function) => void = (
  "captureStackTrace" in Error ? Error.captureStackTrace : (..._args: any[]) => {}
) as any;

export function isObject(data: any): data is Record<PropertyKey, unknown> {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}

export const allowsEval: { value: boolean } = /* @__PURE__*/ cached(() => {
  // Skip the probe under `jitless`: strict CSPs report the caught `new Function` as a `securitypolicyviolation` even though the throw is swallowed.
  if (globalConfig.jitless) {
    return false;
  }

  // @ts-ignore
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }

  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});

export function isPlainObject(o: any): o is Record<PropertyKey, unknown> {
  if (isObject(o) === false) return false;

  // modified constructor
  const ctor = o.constructor;
  if (ctor === undefined) return true;

  if (typeof ctor !== "function") return true;

  // modified prototype
  const prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // ctor doesn't have static `isPrototypeOf`
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }

  return true;
}

export function shallowClone(o: any): any {
  if (isPlainObject(o)) return { ...o };
  if (Array.isArray(o)) return [...o];
  if (o instanceof Map) return new Map(o);
  if (o instanceof Set) return new Set(o);
  return o;
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
      // @ts-ignore
      if (typeof File !== "undefined" && data instanceof File) {
        return "file";
      }
      return "object";

    default:
      throw new Error(`Unknown data type: ${t}`);
  }
};

export const propertyKeyTypes: Set<string> = /* @__PURE__*/ new Set(["string", "number", "symbol"]);
export const primitiveTypes: Set<string> = /* @__PURE__*/ new Set([
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
  "undefined",
]);
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// zod-specific utils
export function clone<T extends schemas.$ZodType>(inst: T, def?: T["_zod"]["def"], params?: { parent: boolean }): T {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent) cl._zod.parent = inst;
  return cl as any;
}

export type EmptyToNever<T> = keyof T extends never ? never : T;

export type Normalize<T> = T extends undefined
  ? never
  : T extends Record<any, any>
    ? Flatten<
        {
          [k in keyof Omit<T, "error" | "message">]: T[k];
        } & ("error" extends keyof T
          ? {
              error?: Exclude<T["error"], string>;
              // path?: PropertyKey[] | undefined;
              // message?: string | undefined;
            }
          : unknown)
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
  return params;
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
    }
  ) as T;
}

export function stringifyPrimitive(value: any): string {
  if (typeof value === "bigint") return value.toString() + "n";
  if (typeof value === "string") return `"${value}"`;
  return `${value}`;
}

export function optionalKeys(shape: schemas.$ZodShape): string[] {
  return Object.keys(shape).filter((k) => {
    return shape[k]!._zod.optin !== undefined && shape[k]!._zod.optout === "optional";
  });
}

export type CleanKey<T extends PropertyKey> = T extends `?${infer K}` ? K : T extends `${infer K}?` ? K : T;
export type ToCleanMap<T extends schemas.$ZodLooseShape> = {
  [k in keyof T]: k extends `?${infer K}` ? K : k extends `${infer K}?` ? K : k;
};
export type FromCleanMap<T extends schemas.$ZodLooseShape> = {
  [k in keyof T as k extends `?${infer K}` ? K : k extends `${infer K}?` ? K : k]: k;
};

// Wrapped in a `@__PURE__` IIFE: esbuild never tree-shakes a top-level initializer that contains a member access on `Number`, so the bare object literal survived into every bundle.
export const NUMBER_FORMAT_RANGES: Record<checks.$ZodNumberFormats, [number, number]> = /*@__PURE__*/ (() => ({
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-3.4028234663852886e38, 3.4028234663852886e38],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
}))();

export const BIGINT_FORMAT_RANGES: Record<checks.$ZodBigIntFormats, [bigint, bigint]> = {
  int64: [/* @__PURE__*/ BigInt("-9223372036854775808"), /* @__PURE__*/ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__*/ BigInt(0), /* @__PURE__*/ BigInt("18446744073709551615")],
};

export function pick(schema: schemas.$ZodObject, mask: Record<string, unknown>): any {
  const currDef = schema._zod.def;

  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }

  const newShape: Writeable<schemas.$ZodShape> = {};
  mirrorShape(newShape, schema, maskedKeys(schema, mask));

  return clone(schema, mergeDefs(currDef, { shape: newShape, checks: [] })) as any;
}

// the mask keys that select something, checked against the source's shape without resolving it
function maskedKeys(schema: schemas.$ZodObject, mask: object): PropertyKey[] {
  const raw = sourceShape(schema);
  const keys: PropertyKey[] = [];
  // `for...in` skips symbols, so a symbol in the mask would select nothing
  for (const key of Reflect.ownKeys(mask)) {
    if (!Object.getOwnPropertyDescriptor(raw, key)?.enumerable) {
      throw new Error(`Unrecognized key: "${String(key)}"`);
    }
    if ((mask as any)[key]) keys.push(key);
  }
  return keys;
}

export function omit(schema: schemas.$ZodObject, mask: object): any {
  const currDef = schema._zod.def;

  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }

  const omitted = new Set(maskedKeys(schema, mask));
  const newShape: Writeable<schemas.$ZodShape> = {};
  mirrorShape(
    newShape,
    schema,
    Reflect.ownKeys(sourceShape(schema)).filter((key) => !omitted.has(key))
  );

  return clone(schema, mergeDefs(currDef, { shape: newShape, checks: [] }));
}

export function extend(schema: schemas.$ZodObject, shape: schemas.$ZodShape): any {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }

  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    // Only throw if new shape overlaps with existing shape. Use getOwnPropertyDescriptor to check key existence without accessing values
    const existingShape = sourceShape(schema);
    for (const key of Reflect.ownKeys(shape)) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== undefined) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }

  return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) })) as any;
}

// the source's keys, then the caller's overlaid on top
function extended(schema: schemas.$ZodObject, shape: schemas.$ZodShape): schemas.$ZodShape {
  const newShape: Writeable<schemas.$ZodShape> = {};
  mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)));
  mirrorProps(newShape, shape);
  return newShape;
}

export function safeExtend(schema: schemas.$ZodObject, shape: schemas.$ZodShape): any {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  return clone(schema, mergeDefs(schema._zod.def, { shape: extended(schema, shape) })) as any;
}

export function merge(a: schemas.$ZodObject, b: schemas.$ZodObject): any {
  if (!b?._zod?.def) {
    throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  }
  if (a._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const newShape: Writeable<schemas.$ZodShape> = {};
  mirrorShape(newShape, a, Reflect.ownKeys(sourceShape(a)));
  mirrorShape(newShape, b, Reflect.ownKeys(sourceShape(b)));

  const def = mergeDefs(a._zod.def, {
    shape: newShape,
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: b._zod.def.checks ?? [],
  });

  return clone(a, def) as any;
}

export function partial(
  Class: SchemaClass<schemas.$ZodOptional> | null,
  schema: schemas.$ZodObject,
  mask: object | undefined,
  name = "partial"
): any {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
  }

  const selected = mask ? new Set(maskedKeys(schema, mask)) : undefined;
  const newShape: Writeable<schemas.$ZodShape> = {};
  mirrorShape(
    newShape,
    schema,
    Reflect.ownKeys(sourceShape(schema)),
    Class &&
      ((value, key) => (selected && !selected.has(key) ? value : new Class({ type: "optional", innerType: value })))
  );

  return clone(schema, mergeDefs(schema._zod.def, { shape: newShape, checks: [] })) as any;
}

export function required(
  Class: SchemaClass<schemas.$ZodNonOptional>,
  schema: schemas.$ZodObject,
  mask: object | undefined
): any {
  const selected = mask ? new Set(maskedKeys(schema, mask)) : undefined;
  const newShape: Writeable<schemas.$ZodShape> = {};
  mirrorShape(newShape, schema, Reflect.ownKeys(sourceShape(schema)), (value, key) =>
    // overwrite with non-optional
    selected && !selected.has(key) ? value : new Class({ type: "nonoptional", innerType: value })
  );

  return clone(schema, mergeDefs(schema._zod.def, { shape: newShape })) as any;
}

export type Constructor<T, Def extends any[] = any[]> = new (...args: Def) => T;

// invalid_type | too_big | too_small | invalid_format | not_multiple_of | unrecognized_keys | invalid_union | invalid_key | invalid_element | invalid_value | custom
export function aborted(x: schemas.ParsePayload, startIndex = 0): boolean {
  if (x.aborted === true) return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}

// Checks for explicit abort (continue === false), as opposed to implicit abort (continue === undefined). Used to respect `abort: true` in .refine() even for checks that have a `when` function.
export function explicitlyAborted(x: schemas.ParsePayload, startIndex = 0): boolean {
  if (x.aborted === true) return true;
  for (let i = startIndex; i < x.issues.length; i++) {
    if (x.issues[i]?.continue === false) {
      return true;
    }
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

/* A check holds no link back to the schema it is attached to — the same check instance is shared by every clone of that schema — so the owner is stamped onto the issues a check just raised, at the only point where both are in scope. Runs on the failure path only; `start` is the issue count from before the check ran. */
export function attachSchema(issues: errors.$ZodRawIssue[], start: number, inst: schemas.$ZodType): void {
  for (let i = start; i < issues.length; i++) {
    (issues[i] as any).schema ??= inst;
  }
}

export function finalizeIssue(
  iss: errors.$ZodRawIssue,
  ctx: schemas.ParseContextInternal | undefined,
  config: $ZodConfig
): errors.$ZodIssue {
  // A schema that raised an issue itself owns it outright, and outranks any stamp an enclosing check left in `attachSchema`. String formats and z.custom() are schema and check at once, so when they act as a check they defer to that stamp instead.
  const traits: Set<string> | undefined = (iss.inst as any)?._zod?.traits;
  if (traits?.has("$ZodType")) {
    if (traits.has("$ZodCheck")) (iss as any).schema ??= iss.inst;
    else (iss as any).schema = iss.inst;
  }

  // Decreasing specificity, first map to return a message wins. `inst` is whatever raised the issue, so a check's own map outranks the owning schema's.
  const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : undefined;
  const message = iss.message
    ? iss.message
    : (unwrapMessage(iss.inst?._zod.def?.error?.(iss as never)) ??
      unwrapMessage(schemaError?.(iss as never)) ??
      unwrapMessage(ctx?.error?.(iss as never)) ??
      unwrapMessage(config.customError?.(iss)) ??
      unwrapMessage(config.localeError?.(iss)) ??
      "Invalid input");

  const { inst: _inst, schema: _schema, continue: _continue, input: _input, ...rest } = iss as any;
  rest.path ??= [];
  rest.message = message;
  if (ctx?.reportInput) {
    rest.input = _input;
  }
  return rest;
}

export function getSizableOrigin(input: any): "set" | "map" | "file" | "unknown" {
  if (input instanceof Set) return "set";
  if (input instanceof Map) return "map";
  // @ts-ignore
  if (input instanceof File) return "file";
  return "unknown";
}

const highSurrogate = /[\uD800-\uDBFF]/;

// Code points in `str`: a surrogate pair counts once, a lone surrogate as itself. Hand-rolled because the string iterator allocates and runs ~250x slower on this path; the regex probe exits ~50x quicker for a string with no astral characters.
export function codePointLength(str: string): number {
  const units = str.length;
  if (!highSurrogate.test(str)) return units;
  let count = units;
  for (let i = 0; i < units - 1; i++) {
    if ((str.charCodeAt(i) & 0xfc00) === 0xd800 && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      count--;
      i++;
    }
  }
  return count;
}

export function getLengthableOrigin(input: any): "array" | "string" | "unknown" {
  if (Array.isArray(input)) return "array";
  if (typeof input === "string") return "string";
  return "unknown";
}

export function parsedType(data: unknown): errors.$ZodInvalidTypeExpected {
  const t = typeof data;
  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "nan" : "number";
    }
    case "object": {
      if (data === null) {
        return "null";
      }
      if (Array.isArray(data)) {
        return "array";
      }

      const obj = data as object;
      if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
        return (obj.constructor as { name: string }).name;
      }
    }
  }
  return t;
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

export function cleanEnum(obj: Record<string, EnumValue>): EnumValue[] {
  return Object.entries(obj)
    .filter(([k, _]) => {
      // return true if NaN, meaning it's not a number, thus a string key
      return Number.isNaN(Number.parseInt(k, 10));
    })
    .map((el) => el[1]);
}

// Codec utility functions
export function base64ToUint8Array(base64: string): InstanceType<typeof Uint8Array> {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binaryString = "";
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}

export function base64urlToUint8Array(base64url: string): InstanceType<typeof Uint8Array> {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  return base64ToUint8Array(base64 + padding);
}

export function uint8ArrayToBase64url(bytes: Uint8Array): string {
  return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function hexToUint8Array(hex: string): InstanceType<typeof Uint8Array> {
  const cleanHex = hex.replace(/^0x/, "");
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}

export function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// instanceof
export abstract class Class {
  constructor(..._args: any[]) {}
}

//////////    PROTOTYPE INSTALLERS     //////////
//
// Members live on the prototype and materialize per instance on first read, which keeps own-property count under the step where V8 stops using inline slots. Changing anything here means re-measuring runtime, memory and bundle size together — see "The three axes" in AGENTS.md.

/**
 * Installs a trait's members on its prototype. Each value builds that member for the instance on first read; the built value shadows the accessor as an own property, so a detached `const { parse } = schema` keeps working.
 *
 * Call this from a `proto` initializer, which runs once per prototype — never per instance.
 */
export function members(proto: object, table: object): void {
  for (const key in table) {
    const desc = Object.getOwnPropertyDescriptor(table, key)!;
    // a getter installs as written, so it stays live: `description` reads through to the registry on every access. not enumerable: an object literal's is, and a prototype member never was
    if (desc.get) Object.defineProperty(proto, key, { ...desc, enumerable: false });
    // a method materializes bound on first read, which is what keeps a detached member working: `const opt = schema.optional; opt()`
    else defineBound(proto, key, desc.value);
  }
  // for..in sees no symbol keys, so well-known members like Symbol.iterator install here
  for (const sym of Object.getOwnPropertySymbols(table)) {
    defineBound(proto, sym, (table as any)[sym]);
  }
}

/** Shadows a prototype member with an own value, so a getter that builds from the instance runs once. */
export function own<T>(inst: object, key: PropertyKey, value: T, enumerable = true): T {
  Object.defineProperty(inst, key, { configurable: true, writable: true, enumerable, value });
  return value;
}

/** Like {@link own}, for a member that was never an own data property and has to stay out of `Object.keys`. */
export function hide<T>(inst: object, key: PropertyKey, value: T): T {
  return own(inst, key, value, false);
}

function defineBound(proto: object, key: PropertyKey, fn: AnyFunc): void {
  Object.defineProperty(proto, key, {
    configurable: true,
    get(this: any) {
      // vitest's spyOn calls a prototype getter bare to find the function it wraps, so a nullish receiver answers the raw method
      return this == null ? fn : own(this, key, fn.bind(this));
    },
    set(this: any, value: unknown) {
      own(this, key, value);
    },
  });
}

/** Returns the prototype to install on, or `undefined` if this group is already installed on it. */
function claim(inst: object, sentinel: string): object | undefined {
  const proto = Object.getPrototypeOf(inst);
  // Runs on every construction, so `in` rather than the costlier `hasOwnProperty.call`. Sentinels are keys the group itself defines.
  return sentinel in proto ? undefined : proto;
}

/** A trait's prototype members: a partial view of its own interface, with `this` typed as the instance. */
export type ProtoOf<T> = {
  // `infer R` resolves a polymorphic `this` return type to `T`, which a method written here can actually produce
  [K in keyof T]?: (T[K] extends (...args: infer A) => infer R ? (...args: A) => R : T[K]) | undefined;
} & ThisType<T>;

// The internals whose init chain is installing. A second call for the same one is a derived constructor overriding its base, so it must not construct another schema in between or the override is dropped.
let installing: object | undefined;

// Set while a getter is running, so a value that resolved through a recursion break is not memoized. One shared descriptor shadows the key for the duration, which costs no per-key allocation.
let broke = false;
const breaker: PropertyDescriptor = {
  configurable: true,
  get() {
    broke = true;
    return undefined;
  },
};

/**
 * Installs a lazily-derived internal on the `_zod` prototype of `inst`'s
 * constructor, computed from the internals object itself and cached there on
 * first read. One accessor per constructor rather than one per instance.
 */
export function defineLazyInternal<T extends { _zod: any }>(
  inst: T,
  key: string,
  compute: (zod: T["_zod"]) => unknown
): void {
  const proto = Object.getPrototypeOf(inst._zod);
  if (key in proto && installing !== inst._zod) {
    // A repeat construction: everything is installed already. Cleared here so the reference is not held past the first construction of every type.
    installing = undefined;
    return;
  }
  installing = inst._zod;

  Object.defineProperty(proto, key, {
    configurable: true,
    get(this: any) {
      // Shadowed before computing so a re-entrant read from a recursive schema resolves to undefined instead of running the getter again.
      Object.defineProperty(this, key, breaker);
      const outer = broke;
      broke = false;
      try {
        const value = compute(this);
        // A result that resolved through a recursion break is recomputed once the graph is complete; everything else memoizes, undefined included.
        if (broke) delete this[key];
        else Object.defineProperty(this, key, { configurable: true, writable: true, value });
        broke = broke || outer;
        return value;
      } catch (err) {
        // A compute that threw memoizes nothing, so a later read runs it again and fails the same way. The shadow goes with it, since leaving it installed would answer undefined for every later read.
        delete this[key];
        broke = broke || outer;
        throw err;
      }
    },
    set(this: any, value: unknown) {
      Object.defineProperty(this, key, { configurable: true, writable: true, value });
    },
  });
}

/**
 * Installs `key` on `inst`'s prototype, computed by `make` on first read and cached there as an own
 * data property. One accessor per constructor rather than one per instance, because an own accessor
 * puts every instance after the first into v8 dictionary mode. The key doubles as the sentinel.
 */
export function installLazyProp(inst: object, key: string, make: (self: any) => unknown, enumerable: boolean): void {
  const proto = claim(inst, key);
  if (!proto) return;
  Object.defineProperty(proto, key, {
    configurable: true,
    get(this: any) {
      // Shadowed before computing, so a re-entrant read from a self-referential shape resolves to undefined instead of running the getter again. A data property rather than an accessor: an own accessor is the dictionary-mode transition this exists to avoid.
      const desc = { configurable: true, writable: true, enumerable, value: undefined as unknown };
      Object.defineProperty(this, key, desc);
      // a compute that throws leaves the shadow behind, so later reads answer undefined instead of re-throwing; `defineLazy` did the same, and `defineLazyInternal`'s delete-on-catch would cost bytes in every bundle for a case only a throwing user getter reaches
      desc.value = make(this);
      Object.defineProperty(this, key, desc);
      return desc.value;
    },
    set(this: any, value: unknown) {
      Object.defineProperty(this, key, { configurable: true, writable: true, enumerable, value });
    },
  });
}

/** Marks the thunk `_catch` synthesises for a constant catch value. `Function.length` cannot tell that thunk from a user callback — rest and defaulted parameters both report arity 0 — and a user callback reads `ctx.error`, whose issues only finalize correctly against the caller's per-parse error map. Provenance can say what arity cannot. A plain string key rather than `Symbol.for`, whose call at module scope no bundler can prove pure — the same shape that anchored `urlCanParse` into every build. */
export const CONSTANT_CATCH = "~constantCatch";

/** Wraps a constant catch value in a thunk tagged with {@link CONSTANT_CATCH}. */
export function constantCatch<T>(value: T): () => T {
  const fn = () => value;
  (fn as { [CONSTANT_CATCH]?: boolean })[CONSTANT_CATCH] = true;
  return fn;
}
