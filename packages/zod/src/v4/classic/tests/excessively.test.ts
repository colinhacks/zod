// tests for "excessively deep and possibly infinite" type instantiation
import type { z } from "zod/v4";

import { test } from "vitest";

test("a", () => {
  type _RefinedSchema<T extends z.ZodType<object> | z.ZodUnion> = T extends z.ZodUnion
    ? RefinedUnionSchema<T> // <-- Type instantiation is excessively deep and possibly infinite.
    : T extends z.ZodType<object>
      ? RefinedTypeSchema<z.output<T>> // <-- Type instantiation is excessively deep and possibly infinite.
      : never;

  type RefinedTypeSchema<T extends object> = T;

  type RefinedUnionSchema<T extends z.ZodUnion> = T;
});
