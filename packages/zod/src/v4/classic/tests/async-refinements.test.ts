import { expect, test } from "vitest";

import * as z from "zod/v4";

test("async refine .parse()", async () => {
  // throws ZodAsyncError
  const s1 = z.string().refine(async (_val) => true);
  expect(() => s1.safeParse("asdf")).toThrow();
});

test("async refine", async () => {
  const s1 = z.string().refine(async (_val) => true);
  const r1 = await s1.parseAsync("asdf");
  expect(r1).toEqual("asdf");

  const s2 = z.string().refine(async (_val) => false);
  const r2 = await s2.safeParseAsync("asdf");
  expect(r2.success).toBe(false);
  expect(r2).toMatchInlineSnapshot(`
    {
      "error": [ZodError: [
      {
        "code": "custom",
        "path": [],
        "message": "Invalid input"
      }
    ]],
      "success": false,
    }
  `);
});

test("async refine with Promises", async () => {
  // expect.assertions(2);

  const schema1 = z.string().refine((_val) => Promise.resolve(true));
  const v1 = await schema1.parseAsync("asdf");
  expect(v1).toEqual("asdf");

  const schema2 = z.string().refine((_val) => Promise.resolve(false));
  await expect(schema2.parseAsync("asdf")).rejects.toBeDefined();

  const schema3 = z.string().refine((_val) => Promise.resolve(true));
  await expect(schema3.parseAsync("asdf")).resolves.toEqual("asdf");
  return await expect(schema3.parseAsync("qwer")).resolves.toEqual("qwer");
});

test("async refine that uses value", async () => {
  const schema1 = z.string().refine(async (val) => {
    return val.length > 5;
  });

  const r1 = await schema1.safeParseAsync("asdf");
  expect(r1.success).toBe(false);
  expect(r1.error).toMatchInlineSnapshot(`
    [ZodError: [
      {
        "code": "custom",
        "path": [],
        "message": "Invalid input"
      }
    ]]
  `);

  const r2 = await schema1.safeParseAsync("asdf123");
  expect(r2.success).toBe(true);
  expect(r2.data).toEqual("asdf123");
});

test("async refinements/transforms survive a patched global Promise (#6019)", async () => {
  // Zone.js / Angular NgZone / @opentelemetry/context-zone replace
  // globalThis.Promise with a subclass. A native promise returned by a user
  // `async` refinement is not `instanceof` that subclass, so zod must not rely
  // on `instanceof Promise` to detect async results.
  const RealPromise = globalThis.Promise;
  class ZoneAwarePromise<T> extends RealPromise<T> {}
  (globalThis as any).Promise = ZoneAwarePromise;
  try {
    // Sanity check: this is the condition that triggered the bug.
    expect((async () => {})() instanceof globalThis.Promise).toBe(false);

    const refine = z.object({ email: z.string() }).superRefine(async (_data, ctx) => {
      await new RealPromise<void>((r) => setTimeout(r, 1));
      ctx.addIssue({ code: "custom", message: "always fails", path: ["email"] });
    });
    const refineResult = await refine.safeParseAsync({ email: "test@example.com" });
    expect(refineResult.success).toBe(false);
    expect(refineResult.error?.issues.map((i) => i.message)).toEqual(["always fails"]);

    const transform = z.string().transform(async (s) => s.toUpperCase());
    expect(await transform.parseAsync("hi")).toEqual("HI");
  } finally {
    (globalThis as any).Promise = RealPromise;
  }
});
