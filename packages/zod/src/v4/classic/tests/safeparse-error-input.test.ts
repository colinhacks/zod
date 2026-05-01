import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod/v4";

// Regression test for #5195: errors must be keyed by input, not output.
test("safeParse error tree is keyed by input type for pipe (#5195)", () => {
  type A = { a: number };
  type B = { b: string };

  const pipe = z.object({ a: z.number().max(9) }).pipe(z.transform<A, B>(({ a }) => ({ b: a.toString() })));

  const result = pipe.safeParse({ a: 10 });
  if (result.success) throw new Error("expected validation failure");

  const tree = z.treeifyError(result.error);
  expect(tree.properties?.a?.errors[0]).toMatch(/9|max/i);

  expectTypeOf(tree.properties?.a).not.toBeNever();
  // @ts-expect-error 'b' is on the output type — must not appear on the error tree
  tree.properties?.b;
});

test("safeParseAsync error tree is keyed by input type for pipe", async () => {
  type A = { a: number };
  type B = { b: string };

  const pipe = z.object({ a: z.number().max(9) }).pipe(z.transform<A, B>(({ a }) => ({ b: a.toString() })));

  const result = await pipe.safeParseAsync({ a: 10 });
  if (result.success) throw new Error("expected validation failure");

  const tree = z.treeifyError(result.error);
  expect(tree.properties?.a?.errors[0]).toMatch(/9|max/i);
  // @ts-expect-error 'b' is on the output type — must not appear on the error tree
  tree.properties?.b;
});

test("safeDecode error tree is keyed by codec input (the value being validated)", () => {
  const codec = z.codec(z.object({ raw: z.string().min(2) }), z.object({ parsed: z.number() }), {
    decode: ({ raw }) => ({ parsed: Number(raw) }),
    encode: ({ parsed }) => ({ raw: String(parsed) }),
  });

  const result = codec.safeDecode({ raw: "x" });
  if (result.success) throw new Error("expected validation failure");

  const tree = z.treeifyError(result.error);
  expect(tree.properties?.raw?.errors[0]).toMatch(/2|small/i);
  // @ts-expect-error 'parsed' is on the codec output — must not appear on the decode error tree
  tree.properties?.parsed;
});

test("safeEncode error tree is keyed by codec output (the value being validated in reverse)", () => {
  const codec = z.codec(z.object({ raw: z.string() }), z.object({ parsed: z.number().max(9) }), {
    decode: ({ raw }) => ({ parsed: Number(raw) }),
    encode: ({ parsed }) => ({ raw: String(parsed) }),
  });

  const result = codec.safeEncode({ parsed: 100 });
  if (result.success) throw new Error("expected validation failure");

  const tree = z.treeifyError(result.error);
  expect(tree.properties?.parsed?.errors[0]).toMatch(/9|max/i);
  // @ts-expect-error 'raw' is on the codec input — must not appear on the encode error tree
  tree.properties?.raw;
});

test("ZodSafeParseResult one-arg form is backward-compatible", () => {
  const _: z.ZodSafeParseResult<string> = z.string().safeParse("ok");
  void _;
});
