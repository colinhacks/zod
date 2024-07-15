interface ZodT {
  "~input"?: unknown;
  "~output"?: unknown;
  "~async"?: true;
  "~meta"?: unknown;
  "~optional"?: true;
}

type isOptional<T extends ZodT> = T["~optional"] extends true ? true : false;
type asdf = isOptional<ZodT>;

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type $override<T extends $ZodType, O extends ZodT> = T & { "~overrides": O };
type $meta<M> = { "~overrides": { "~meta": M } };
type $async = { "~overrides": { "~async": true } };
type $output<T, O> = T & { "~overrides": { "~output": O } };
type $input<T, I> = T & { "~overrides": { "~input": I } };
type $optional = { "~overrides": { "~optional": true } };
abstract class $ZodType {
  "~overrides": ZodT;
  "~output": this["~overrides"]["~async"] extends true
    ? Promise<this["~overrides"]["~output"]>
    : this["~overrides"]["~output"];

  abstract parse(data: unknown): this["~output"];

  meta<T>(data: T): this & $meta<T> {
    return this as any;
  }

  async(): this & $async {
    return this as any;
  }

  optional(): this & $optional {
    return {
      ...this,
      "~overrides": {
        ...this["~overrides"],
        "~optional": true,
      },
    };
  }
}

interface Methods {
  method(): boolean;
}
interface $ZodString extends Methods {}
// class $ZodString extends $ZodType {
//   override
//   parse(data: unknown): this["~output"] {
//     return data as string;
//   }
// }

class $ZodString extends $ZodType {
  override "~overrides": {
    "~input": string;
    "~output": string;
  };
  parse(data: unknown): this["~output"] {
    return data as this["~output"];
  }
}

class ZodString extends $ZodString {}

function string(): ZodString {
  return new $ZodString() as any;
}

const s1 = string();
s1["~overrides"];
const d1 = s1.parse("hello");
const s2 = s1.meta({ hello: "there" });
const d2 = s2.parse("hello");
const s3 = s2.async();
const d3 = s3.parse("hello");

export type {};

type alksjdf = Prettify<
  {
    overrides: { meta: { name: "Colin" } };
  } & {
    overrides: { meta: { age: 30 } };
  }
>;
