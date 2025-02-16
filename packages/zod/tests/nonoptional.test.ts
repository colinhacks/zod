import { expect, expectTypeOf, test } from "vitest";
import { z } from "zod";

test("nonoptional with default", () => {
  const schema = z.string().optional().nonoptional();
  expectTypeOf<typeof schema._input>().toEqualTypeOf<string | undefined>();
  expectTypeOf<typeof schema._output>().toEqualTypeOf<string>();

  const result = schema.safeParse(undefined);
  expect(result.success).toBe(false);
  expect(result).toMatchInlineSnapshot();
});

test("nonoptional in object", () => {
  const schema = z.object({ hi: z.string().optional().nonoptional() });

  expectTypeOf<typeof schema._input>().toEqualTypeOf<{ hi: string | undefined }>();
  expectTypeOf<typeof schema._output>().toEqualTypeOf<{ hi: string }>();
  expect(schema.parse(undefined)).toBe("hi");
});
