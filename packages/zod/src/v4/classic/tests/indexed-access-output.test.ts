import { expectTypeOf, test } from "vitest";
import * as z from "zod";

test("z.outputStrict preserves indexed-access correlation (regression #5154)", () => {
  const schemas = { a: z.string(), b: z.number(), c: z.boolean() };
  type Schemas = typeof schemas;

  function p<K extends keyof Schemas>(k: K, v: unknown): z.outputStrict<Schemas[K]> {
    return schemas[k].parse(v);
  }

  expectTypeOf(p("a", "x")).toEqualTypeOf<string>();
  expectTypeOf(p("b", 1)).toEqualTypeOf<number>();
  expectTypeOf(p("c", true)).toEqualTypeOf<boolean>();
});
