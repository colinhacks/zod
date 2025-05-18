// @ts-ignore TS6133
import { expect, expectTypeOf, test } from "vitest";

import * as z from "zod/v4";

test(".optional()", () => {
  const schema = z.string().optional();
  expect(schema.parse("adsf")).toEqual("adsf");
  expect(schema.parse(undefined)).toEqual(undefined);
  expect(schema.safeParse(null).success).toEqual(false);

  expectTypeOf<typeof schema._output>().toEqualTypeOf<string | undefined>();
});

test("unwrap", () => {
  const unwrapped = z.string().optional().unwrap();
  expect(unwrapped).toBeInstanceOf(z.ZodString);
});
