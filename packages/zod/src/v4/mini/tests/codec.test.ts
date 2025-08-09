import { expect, test } from "vitest";
import * as z from "zod/mini";

test("codec encode decode", async () => {
  const schema = z.codec(z.string(), z.object({ a: z.number() }), {
    decode: (str: string) => JSON.parse(str),
    encode: (obj: { a: number }) => JSON.stringify(obj),
  });

  const decoded = z.decode(schema, '{"a":1}');
  expect(decoded).toEqual({ a: 1 });

  const encoded = await z.encodeAsync(schema, { a: 1 });
  expect(encoded).toBe('{"a":1}');
});
