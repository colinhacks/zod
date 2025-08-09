import { expect, test } from "vitest";
import * as z from "../../index.js";

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

test("safe encode decode", () => {
  const schema = z.codec(z.string(), z.object({ a: z.number() }), {
    decode: (str: string) => JSON.parse(str),
    encode: (obj: { a: number }) => JSON.stringify(obj),
  });

  const decoded = z.safeDecode(schema, '{"a":1}');
  expect(decoded).toEqual({ success: true, data: { a: 1 } });

  const encoded = z.safeEncode(schema, { a: 1 });
  expect(encoded).toEqual({ success: true, data: '{"a":1}' });
});

test("encode throws on transform", () => {
  const schema = z.string().transform((v: string) => v);
  expect(() => z.encode(schema as any, "a")).toThrow(z.ZodEncodeError);
});

test("safeEncode fails on transform", () => {
  const schema = z.string().transform((v: string) => v);
  const result = z.safeEncode(schema as any, "a");
  expect(result.success).toBe(false);
});
