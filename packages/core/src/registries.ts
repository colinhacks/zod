import type * as core from "./core.js";
import type { $ZodType } from "./schemas.js";

export const $output: unique symbol = Symbol("ZodOutput");
export type $output = typeof $output;
export const $input: unique symbol = Symbol("ZodInput");
export type $input = typeof $input;

export type $replace<Meta, S extends $ZodType> = Meta extends $output
  ? core.output<S>
  : Meta extends $input
    ? core.input<S>
    : Meta extends (infer M)[]
      ? $replace<M, S>[]
      : // handle objecs
        Meta extends object
        ? { [K in keyof Meta]: $replace<Meta[K], S> }
        : Meta;

type MetadataType = Record<string, unknown> | undefined;
export class $ZodRegistry<Meta extends MetadataType = MetadataType, Schema extends $ZodType = $ZodType> {
  _meta!: Meta;
  _schema!: Schema;
  _map: WeakMap<Schema, $replace<Meta, Schema>> = new WeakMap();
  _idmap: Map<string, Schema> = new Map();

  add<S extends Schema>(
    schema: S,
    ..._meta: undefined extends Meta ? [$replace<Meta, S>?] : [$replace<Meta, S>]
  ): this {
    const meta: any = _meta[0];
    this._map.set(schema, meta!);
    if (meta && typeof meta === "object" && "id" in meta) {
      if (this._idmap.has(meta.id!)) {
        throw new Error(`ID ${meta.id} already exists in the registry`);
      }
      this._idmap.set(meta.id!, schema);
    }
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
  id?: string | undefined;
  title?: string | undefined;
  description?: string | undefined;
  examples?: $output[] | undefined;
  [k: string]: unknown;
}

// export class $ZodJSONSchemaRegistry<
//   Meta extends JSONSchemaMeta = JSONSchemaMeta,
//   Schema extends $ZodType = $ZodType,
// > extends $ZodRegistry<Meta, Schema> {
//   toJSONSchema(_schema: Schema): object {
//     return {};
//   }
// }

export interface GlobalMeta extends JSONSchemaMeta {}

// registries
export function registry<T extends MetadataType = MetadataType, S extends $ZodType = $ZodType>(): $ZodRegistry<T, S> {
  return new $ZodRegistry<T, S>();
}

export const globalRegistry: $ZodRegistry<GlobalMeta> = /*@__PURE__*/ registry<GlobalMeta>();
