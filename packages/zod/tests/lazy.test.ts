import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod";

test("opt passthrough", () => {
  const object = z.object({
    a: z.lazy(() => z.string()),
    b: z.lazy(() => z.string().optional()),
    c: z.lazy(() => z.string().default("default")),
  });

  type ObjectTypeIn = z.input<typeof object>;
  expectTypeOf<ObjectTypeIn>().toEqualTypeOf<{
    a: string;
    b?: string | undefined;
    c?: string | undefined;
  }>();

  type ObjectTypeOut = z.output<typeof object>;
  expectTypeOf<ObjectTypeOut>().toEqualTypeOf<{
    a: string;
    b?: string | undefined;
    c: string;
  }>();

  const result = object.parse(
    {
      a: "hello",
      b: undefined,
    },
    { noPrecompilation: true }
  );
  expect(result).toEqual({
    a: "hello",
    // b: undefined,
    c: "default",
  });

  expect(z.lazy(() => z.string())._zod.optionality).toEqual(undefined);
  expect(z.lazy(() => z.string().optional())._zod.optionality).toEqual("optional");
  expect(z.lazy(() => z.string().default("asdf"))._zod.optionality).toEqual("defaulted");
});
