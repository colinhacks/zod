import { expect, test } from "vitest";
import * as z from "zod/mini";

test("z.function", () => {
  expect(true).toEqual(true);
});

test("implement exposes the function schema at runtime", () => {
  const schema = z.function({ input: [z.string()], output: z.number() });
  const fn = schema.implement((s) => s.length);

  expect((fn as any)._zod).toBe(schema._zod);
  expect(fn("asdf")).toBe(4);
});
