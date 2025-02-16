import type * as base from "./base.js";
import { cached } from "./util.js";

export const OUTPUT = Symbol("ZodOutput");
export type OUTPUT = typeof OUTPUT;
export const INPUT = Symbol("ZodInput");
export type INPUT = typeof INPUT;

export type Replacer<Meta, S extends base.$ZodType> = Meta extends OUTPUT
  ? base.output<S>
  : Meta extends INPUT
    ? base.input<S>
    : Meta extends (infer M)[]
      ? Replacer<M, S>[]
      : // handle objecs
        Meta extends object
        ? { [K in keyof Meta]: Replacer<Meta[K], S> }
        : Meta;

export class $ZodRegistry<Meta = unknown, Schema extends base.$ZodType = base.$ZodType> {
  _meta!: Meta;
  _schema!: Schema;
  _metaMap: Map<Schema, Replacer<Meta, Schema>> = new Map();

  get entries(): Array<[Schema, Replacer<Meta, Schema>]> {
    return Array.from(this._metaMap.entries());
  }

  add<S extends Schema>(
    schema: S,
    ...meta: undefined extends Meta ? [Replacer<Meta, S>?] : [Replacer<Meta, S>]
  ): $ZodRegistry<Meta, Schema> {
    this._metaMap.set(schema, (meta as any)[0]!);
    return this as any;
  }

  remove(schema: Schema): this {
    this._metaMap.delete(schema);
    return this;
  }

  get<S extends Schema>(schema: S): Replacer<Meta, S> | undefined {
    return this._metaMap.get(schema) as any;
  }

  has(schema: Schema): boolean {
    return this._metaMap.has(schema);
  }
}

// type Prettify<T> = { [k in keyof T]: T[k] } & {};
// type Writable<T> = Prettify<{ -readonly [k in keyof T]: T[k] }>;
// export class $ZodNamedRegistry<
//   Meta extends { name: string } = { name: string },
//   Schema extends base.$ZodType = base.$ZodType,
//   Items extends Record<string, Meta> = {},
// > extends $ZodRegistry<Meta, Schema> {
//   get items(): Items {
//     // return object with names as keys and meta objects as values
//     const obj: any = {};
//     for (const [k, v] of this._metaMap) {
//       obj[v.name] = v;
//     }
//     return obj;
//   }
//   override _metaMap: Map<Schema, Replacer<Meta, Schema>> = new Map();
//   _nameMap: Map<string, Schema> = new Map();

//   override add<S extends Schema, const M extends Replacer<Meta, S>>(
//     schema: S,
//     meta: M
//   ): $ZodNamedRegistry<Meta, S, Prettify<Items & { [k in M["name"]]: Writable<M> }>> {
//     this._metaMap.set(schema, meta);
//     this._nameMap.set(meta.name, schema);
//     return this as any;
//   }

//   override remove(schema: Schema): $ZodNamedRegistry<Meta, Schema, Items>;
//   override remove<Key extends keyof Items>(schema: Key): $ZodNamedRegistry<Meta, Schema, Omit<Items, Key>>;
//   override remove(arg: any): $ZodNamedRegistry<Meta, Schema, Items> {
//     const schema: Schema | undefined = typeof arg === "string" ? this._nameMap.get(arg) : arg;
//     if (!schema) throw new Error("Schema not found");
//     this._nameMap.delete(this._metaMap.get(schema)?.name!);
//     this._metaMap.delete(schema);
//     return this;
//   }

//   override get(schema: Schema): Meta | undefined;
//   override get<K extends keyof Items>(key: K): Items[K];
//   override get(arg: any): Meta | undefined {
//     if (typeof arg === "string") {
//       return this._metaMap.get(this._nameMap.get(arg)!);
//     }
//     return this._metaMap.get(arg);
//   }

//   override has(schema: Schema): boolean;
//   override has(key: keyof Items): boolean;
//   override has(arg: any) {
//     if (typeof arg === "string") {
//       return this._nameMap.has(arg);
//     }
//     return this._metaMap.has(arg);
//   }
// }
export interface JSONSchemaMeta {
  title?: string;
  description?: string;
  examples?: OUTPUT[];
  [k: string]: unknown;
}

export class $ZodJSONSchemaRegistry<
  Meta extends JSONSchemaMeta = JSONSchemaMeta,
  Schema extends base.$ZodType = base.$ZodType,
> extends $ZodRegistry<Meta, Schema> {
  toJSONSchema(title: string) {
    let schema!: base.$ZodType;
    for (const [_, meta] of this.entries) {
      if (meta.title === title) {
        if (schema) throw new Error(`Multiple schemas with title ${title}`);
        schema = _;
      }
    }
    // return toJSONSchema
    return {};
  }
}

export interface GlobalMeta extends JSONSchemaMeta {}

export const globalRegistry: $ZodJSONSchemaRegistry<GlobalMeta> =
  /*@__PURE__*/ new $ZodJSONSchemaRegistry<GlobalMeta>();

//////////     REGISTRIES     //////////
export function registry<T = undefined, S extends base.$ZodType = base.$ZodType>(): $ZodRegistry<T, S> {
  return new $ZodRegistry();
}
