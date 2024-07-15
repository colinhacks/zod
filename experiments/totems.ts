interface ZodT {
  "~input": unknown;
  "~output": unknown;
  "~async": boolean;
  "~meta": unknown;
}

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// type $assign<Old extends ZodT, New extends ZodT> = Prettify<
//   Omit<Old, keyof New> & New
// >;
type $merge<Old extends ZodT, New extends Partial<ZodT>> = Prettify<{
  "~overrides": true;
  "~input": "~input" extends keyof New ? New["~input"] : Old["~input"];
  "~output": "~output" extends keyof New ? New["~output"] : Old["~output"];
  "~async": "~async" extends keyof New ? New["~async"] : Old["~async"];
  "~meta": "~meta" extends keyof New
    ? Old["~meta"] & New["~meta"]
    : Old["~meta"];
}>;
// type $override<T extends $ZodType<any>, O extends Partial<ZodT>> = {
//   "~override": true;
//   "~base": "~base" extends keyof T ? T["~base"] : T;
//   "~input": "~input" extends keyof O ? O["~input"] : T["~input"];
//   "~output": "~output" extends keyof O ? O["~output"] : T["~output"];
//   "~async": "~async" extends keyof O ? O["~async"] : T["~async"];
//   "~meta": "~meta" extends keyof O ? O["~meta"] : T["~meta"];
// } & T["~base"];
type $override<T extends $ZodType, O extends ZodT> = T & { "~overrides": O };
type $meta<M> = { "~overrides": { "~meta": M } };
abstract class $ZodType {
  "~base": $ZodType;
  "~overrides": ZodT;
  // "~input": T["~input"];
  // "~output": T["~output"];
  // "~async": T["~async"];
  // "~meta": T["~meta"];
  "~output": this["~overrides"]["~async"] extends true
    ? Promise<this["~overrides"]["~output"]>
    : this["~overrides"]["~output"];

  abstract parse(data: unknown): this["~output"];

  meta<T>(data: T): this & $meta<T> {
    // $override<this["~base"], $merge<this["~overrides"], { "~meta": T }>> {
    return this as any;
  }

  async(): $override<
    this["~base"],
    $merge<this["~overrides"], { "~async": true }>
  > {
    return this as any;
  }
}

class $ZodString extends $ZodType {
  override "~base": $ZodString;

  parse(data: unknown): this["~output"] {
    return data as string;
  }
}

interface ZodString extends $ZodType {
  "~overrides": {
    "~input": string;
    "~output": string;
    "~async": false;
    "~meta": unknown;
  };
}

function string(): ZodString {
  return new $ZodString() as any;
}

const s1 = string();
s1["~overrides"];
s1.parse("hello");
const s2 = s1.meta({ hello: "there" }); //.async();
const d2 = s2.parse("hello");

export type {};

type alksjdf = Prettify<
  {
    overrides: { meta: { name: "Colin" } };
  } & {
    overrides: { meta: { age: 30 } };
  }
>;
