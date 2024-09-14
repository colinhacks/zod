import * as classes from "../classes.js";
import type * as core from "../core.js";

type AnyZodType = core.$ZodType<{
  "~output": any;
  "~input": never;
}>;
type Mix<A extends AnyZodType, B extends AnyZodType> = A & B;
type Nullable<T> = {
  __nullable: T;
};

interface ZodType<O, I, Props extends { type: string }>
  extends core.$ZodType<{
    "~output": O;
    "~input": I;
  }> {
  type: Props["type"];
  nullable(): Nullable<this>;
}

export interface ZodString<O extends string, I extends never>
  extends ZodType<O, I, { type: "string" }> {}
export class ZodString<O = string, I = never> extends classes.$ZodString<{
  "~output": O;
  "~input": I;
}> {}
