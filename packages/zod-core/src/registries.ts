import type * as base from "./base.js";

export class $ZodRegistry<
  Meta = unknown,
  Schema extends base.$ZodType = base.$ZodType,
> {
  _meta!: Meta;
  _schema!: Schema;
  _metaMap: Map<Schema, Meta> = new Map();

  add(
    schema: Schema,
    ...meta: undefined extends Meta ? [Meta?] : [Meta]
  ): $ZodRegistry<Meta, Schema> {
    this._metaMap.set(schema, meta[0]!);
    return this;
  }
  remove(schema: Schema): $ZodRegistry<Meta, Schema> {
    this._metaMap.delete(schema);
    return this;
  }
  get(schema: Schema): Meta | undefined {
    return this._metaMap.get(schema);
  }
  has(schema: Schema): boolean {
    return this._metaMap.has(schema);
  }
}

type Prettify<T> = { [k in keyof T]: T[k] } & {};
type Writable<T> = Prettify<{ -readonly [k in keyof T]: T[k] }>;
export class $ZodNamedRegistry<
  Meta extends { name: string } = { name: string },
  Schema extends base.$ZodType = base.$ZodType,
  Items extends Record<string, Meta> = {},
> extends $ZodRegistry<Meta, Schema> {
  get items(): Items {
    // return object with names as keys and meta objects as values
    const obj: any = {};
    for (const [k, v] of this._metaMap) {
      obj[v.name] = v;
    }
    return obj;
  }
  override _metaMap: Map<Schema, Meta> = new Map();
  _nameMap: Map<string, Schema> = new Map();

  override add<const M extends Meta>(
    schema: Schema,
    meta: M
  ): $ZodNamedRegistry<
    Meta,
    Schema,
    Prettify<Items & { [k in M["name"]]: Writable<M> }>
  > {
    this._metaMap.set(schema, meta);
    this._nameMap.set(meta.name, schema);
    return this as any;
  }
  override remove(schema: Schema): $ZodNamedRegistry<Meta, Schema, Items>;
  override remove<Key extends keyof Items>(
    schema: Key
  ): $ZodNamedRegistry<Meta, Schema, Omit<Items, Key>>;
  override remove(arg: any): $ZodNamedRegistry<Meta, Schema, Items> {
    const schema: Schema | undefined =
      typeof arg === "string" ? this._nameMap.get(arg) : arg;
    if (!schema) throw new Error("Schema not found");
    this._nameMap.delete(this._metaMap.get(schema)?.name!);
    this._metaMap.delete(schema);
    return this;
  }

  override get(schema: Schema): Meta | undefined;
  override get<K extends keyof Items>(key: K): Items[K];
  override get(arg: any): Meta | undefined {
    if (typeof arg === "string") {
      return this._metaMap.get(this._nameMap.get(arg)!);
    }
    return this._metaMap.get(arg);
  }
  override has(schema: Schema): boolean;
  override has(key: keyof Items): boolean;
  override has(arg: any) {
    if (typeof arg === "string") {
      return this._nameMap.has(arg);
    }
    return this._metaMap.has(arg);
  }
}
