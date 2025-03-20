import type * as core from "./core.js";
import type { $ZodType } from "./schemas.js";

export const OUTPUT: unique symbol = Symbol("ZodOutput");
export type OUTPUT = typeof OUTPUT;
export const INPUT: unique symbol = Symbol("ZodInput");
export type INPUT = typeof INPUT;

export type $replace<Meta, S extends $ZodType> = Meta extends OUTPUT
  ? core.output<S>
  : Meta extends INPUT
    ? core.input<S>
    : Meta extends (infer M)[]
      ? $replace<M, S>[]
      : // handle objecs
        Meta extends object
        ? { [K in keyof Meta]: $replace<Meta[K], S> }
        : Meta;

export class $ZodRegistry<Meta = unknown, Schema extends $ZodType = $ZodType> {
  _meta!: Meta;
  _schema!: Schema;
  _map: WeakMap<Schema, $replace<Meta, Schema>> = new WeakMap();

  add<S extends Schema>(schema: S, ...meta: undefined extends Meta ? [$replace<Meta, S>?] : [$replace<Meta, S>]): this {
    this._map.set(schema, (meta as any)[0]!);
    return this as any;
  }

  remove(schema: Schema): this {
    this._map.delete(schema);
    return this;
  }

  get<S extends Schema>(schema: S): $replace<Meta, S> | undefined {
    return this._map.get(schema) as any;
  }

  has(schema: Schema): boolean {
    return this._map.has(schema);
  }
}

export interface JSONSchemaMeta {
  id?: string;
  title?: string;
  description?: string;
  examples?: OUTPUT[];
  [k: string]: unknown;
}

export class $ZodJSONSchemaRegistry<
  Meta extends JSONSchemaMeta = JSONSchemaMeta,
  Schema extends $ZodType = $ZodType,
> extends $ZodRegistry<Meta, Schema> {
  toJSONSchema(_schema: Schema): object {
    return {};
  }
}

export interface GlobalMeta extends JSONSchemaMeta {}

export const globalRegistry: $ZodJSONSchemaRegistry<GlobalMeta> =
  /*@__PURE__*/ new $ZodJSONSchemaRegistry<GlobalMeta>();

// registries
export function registry<T = undefined, S extends $ZodType = $ZodType>(): $ZodRegistry<T, S> {
  return new $ZodRegistry();
}

export function jsonSchemaRegistry<
  T extends JSONSchemaMeta = JSONSchemaMeta,
  S extends $ZodType = $ZodType,
>(): $ZodJSONSchemaRegistry<T, S> {
  return new $ZodJSONSchemaRegistry();
}
