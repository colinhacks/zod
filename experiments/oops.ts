// a less object-oriented approach

interface ZodDef {
  kind: string;
}

abstract class ZodType implements ZodDef {
  kind: string;

  "~metadata"?: unknown;
  "~output": unknown;
  "~input": unknown;
  "~context": unknown;
  abstract "~parse"(x: unknown): this["~output"];

  shortcircuits: Set<Primitive> = new Set();

  meta(): this["~metadata"];
  meta<M>(meta: M): $meta<this, M>;
  meta<M>(meta?: M) {
    if (meta === undefined) return this["~metadata"];
    return { ...this, "~metadata": meta };
  }

  optional(): $optional<this> {
    return {
      ...this,
      shortcircuits: new Set([...this.shortcircuits, undefined]),
    };
  }
}

type Primitive = string | number | boolean | bigint | symbol | undefined | null;
type PrimitiveTypes =
  | "string"
  | "number"
  | "boolean"
  | "bigint"
  | "symbol"
  | "undefined"
  | "null";

abstract class ZodPrimitive extends ZodType {
  kind = "primitive" as const;
  types: { [k in PrimitiveTypes]?: true | false };
  override "~output": Primitive;
  override "~input": Primitive;
}

class ZodString extends ZodPrimitive {
  types: { string: true } = { string: true };
  override "~output": string;
  override "~input": string;
  "~parse"(x: unknown): string {
    if (typeof x === "string") return x;
    throw new Error();
  }
}

type $meta<T extends ZodType, M> = T & { "~metadata": M; "~inner": T };
const $optional = Symbol("optional");
type $optional<T extends ZodType> = Omit<T, "~output" | "~input"> & {
  "~output": T["~output"] | typeof $optional;
  "~input": T["~input"] | typeof $optional;
};

type OmitVirtuals<T> = {
  [k in keyof T as k extends `~${string}` ? never : k]: T[k];
};

function makeString(): ZodString {
  return new ZodString();
}

const schema = makeString().meta({ hello: "world" }).optional();
schema.meta();
schema["~output"];
console.log(schema["~parse"]("asdfasdf"));

// z.string().mutate(val => val.toLowerCase());
