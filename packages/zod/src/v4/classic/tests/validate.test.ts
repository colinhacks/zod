import { expect, expectTypeOf, test } from "vitest";

import * as zm from "zod/mini";
import * as z from "zod/v4";

test("validate answers like safeParse.success", () => {
  expect(z.validate(z.string(), "asdf")).toBe(true);
  expect(z.validate(z.string(), 12)).toBe(false);
  expect(z.validate(z.number().int().min(0), 5)).toBe(true);
  expect(z.validate(z.number().int().min(0), -5)).toBe(false);
  const schema = z.object({ a: z.string(), b: z.array(z.number()) });
  expect(z.validate(schema, { a: "x", b: [1, 2] })).toBe(true);
  expect(z.validate(schema, { a: "x", b: [1, "2"] })).toBe(false);
  expect(z.validate(schema, null)).toBe(false);
});

test("validate runs transforms and refinements for the verdict only", () => {
  const schema = z
    .string()
    .transform((s) => s.length)
    .pipe(z.number().max(3));
  expect(z.validate(schema, "ab")).toBe(true);
  expect(z.validate(schema, "abcd")).toBe(false);
  expect(z.validate(z.coerce.number(), "5")).toBe(true);
});

test("validate narrows to the input type", () => {
  const value: unknown = "hi";
  if (z.validate(z.string(), value)) {
    expectTypeOf(value).toEqualTypeOf<string>();
  }
  const transforming = z.string().transform((s) => s.length);
  if (z.validate(transforming, value)) {
    expectTypeOf(value).toEqualTypeOf<string>();
  }
});

test("validate throws on async schemas; validateAsync handles them", async () => {
  const schema = z.string().refine(async (s) => s.length > 2);
  expect(() => z.validate(schema, "asdf")).toThrow();
  await expect(z.validateAsync(schema, "asdf")).resolves.toBe(true);
  await expect(z.validateAsync(schema, "a")).resolves.toBe(false);
  await expect(z.validateAsync(z.string(), "a")).resolves.toBe(true);
  // a promise-returning callback that is not declared async compiles, so the compiled schema must stay off the fast path
  const compiled = z.compile(z.string().refine((s) => Promise.resolve(s.length > 1)));
  await expect(z.validateAsync(compiled, "abc")).resolves.toBe(true);
  await expect(z.validateAsync(compiled, "a")).resolves.toBe(false);
});

test("validate agrees with the compiled fast path and keeps the callback bound", () => {
  let calls = 0;
  const schema = z.object({
    name: z.string().refine((s) => {
      calls++;
      return s.length > 1;
    }),
  });
  const compiled = z.compile(schema);

  calls = 0;
  expect(z.validate(compiled, { name: "ok" })).toBe(true);
  expect(calls).toBe(1);

  calls = 0;
  expect(z.validate(compiled, { name: "x" })).toBe(false);
  // a user callback can throw, so its rejection is not decidable and the fallback still runs
  expect(calls).toBeLessThanOrEqual(2);

  expect(z.validate(compiled, { name: 42 })).toBe(false);
  expect(z.validate(compiled, { name: "x" }, {})).toBe(false);
  expect(z.validate(schema, { name: "ok" })).toBe(true);
});

test("the validate shortcut is taken for callback-free schemas only", () => {
  const definite = (s: z.ZodType) => (z.compile(s, { strict: true }) as any)._zod.bag.validator?.definite;

  // nothing here can throw, so a compiled rejection is proof the runtime would reject
  expect(definite(z.object({ a: z.string().min(1), b: z.number().max(3), c: z.email() }))).toBe(true);
  expect(definite(z.array(z.enum(["a", "b"])))).toBe(true);

  // each of these can answer INVALID for something the interpreter throws on
  expect(definite(z.object({ a: z.string().refine(() => true) }))).toBe(false);
  expect(definite(z.string().transform((v) => v))).toBe(false);
  expect(definite(z.custom(() => true))).toBe(false);
  expect(definite(z.number().catch(0))).toBe(false);
  expect(definite(z.lazy(() => z.string()))).toBe(false);
  expect(
    definite(
      z.intersection(
        z.number(),
        z.number().transform((x) => x + 1)
      )
    )
  ).toBe(false);
  expect(
    definite(
      z.record(
        z.string().transform((k) => k),
        z.number()
      )
    )
  ).toBe(false);
});

test("compiled validate keeps the fallback where INVALID is not a decidable rejection", () => {
  // an intersection answers INVALID for an unmergeable merge, which the interpreter answers with a throw — a fast false would misreport a schema bug
  const unmergeable = z.compile(
    z.intersection(
      z.number(),
      z.number().transform((x) => x + 1)
    ),
    { strict: true }
  );
  expect(() => z.validate(unmergeable, 1234)).toThrow("Unmergable intersection");

  // a when-gated check islands at codegen, and an island answers INVALID for an async run too
  const gated = z.number().refine(() => Promise.resolve(true));
  (gated._zod.def.checks![0]!._zod.def as { when?: unknown }).when = () => true;
  const compiled = z.compile(z.object({ n: gated }), { strict: true });
  expect(() => z.validate(compiled, { n: 3 })).toThrow(z.core.$ZodAsyncError);
  expect(() => z.validate(z.object({ n: gated }), { n: 3 })).toThrow(z.core.$ZodAsyncError);

  // a plain function handing back a promise answers INVALID for union parity, so a transform is never a decidable rejection
  const piped = z.string().transform(() => Promise.resolve(1));
  expect(() => z.validate(z.compile(piped, { strict: true }), "x")).toThrow(z.core.$ZodAsyncError);
  expect(() => z.validate(piped, "x")).toThrow(z.core.$ZodAsyncError);

  // a continuable child issue short-circuits the compiled intersection before its merge, but the interpreter reaches the merge and throws
  const continuable = z.intersection(
    z.number().min(10),
    z.number().transform((x) => x + 1)
  );
  expect(() => z.validate(z.compile(continuable, { strict: true }), 1)).toThrow("Unmergable intersection");
  expect(() => z.validate(continuable, 1)).toThrow("Unmergable intersection");
});

test("compiled validate agrees with the interpreter, verdict and throw alike", () => {
  // guards the `definite` flag: a new generator that answers INVALID for something the interpreter throws on must clear it, or this fails
  const thenable = () => Promise.resolve(1) as never;
  const schemas: z.ZodType[] = [
    z.object({ a: z.string(), b: z.number().min(1) }),
    z.strictObject({ a: z.string() }),
    z.array(z.string().min(1)),
    z.tuple([z.string()], z.number()),
    z.record(z.string(), z.number()),
    // a record key compiles in its own context, so its definiteness has to be carried out
    z.record(z.string().transform(thenable), z.number()),
    z.record(z.email(), z.number()),
    z.union([z.string(), z.number()]),
    z.intersection(
      z.number(),
      z.number().transform((x) => x + 1)
    ),
    z.intersection(
      z.number().min(10),
      z.number().transform((x) => x + 1)
    ),
    // unmergeable with no user callback in it, so only the intersection itself can clear the flag
    z.intersection(z.string().default("a"), z.string().default("b")),
    z.lazy(() => z.object({ a: z.string() })),
    z.number().catch(0),
    z.nonoptional(z.string().optional()),
    z.map(z.string(), z.number()),
    z.set(z.string().min(2)),
    z.templateLiteral(["a", z.number()]),
    z.coerce.number(),
    z.stringbool(),
    z.string().transform(thenable),
    z.union([z.string().transform(thenable), z.number()]),
    z.array(z.string().transform(thenable)),
    z.custom(thenable),
    z.string().refine(thenable),
    z.string().pipe(z.string().min(3)),
    // a codec's decode is the pipe branch's transform, and a plain function can still hand back a promise
    z.codec(z.string(), z.number(), { decode: thenable, encode: String }),
    z.object({ first: z.string(), second: z.codec(z.string(), z.number(), { decode: thenable, encode: String }) }),
    // a user callback can throw, and compiled code can reject an earlier sibling before ever reaching it
    z.object({
      first: z.string(),
      second: z.string().refine(() => {
        throw new RangeError("u");
      }),
    }),
    z.object({
      first: z.string(),
      second: z.custom(() => {
        throw new TypeError("u");
      }),
    }),
    // superRefine and check take the other branch of the refine generator than refine does
    z.object({
      first: z.string(),
      second: z.string().superRefine(() => {
        throw new RangeError("u");
      }),
    }),
    z.string().superRefine(thenable as never),
    z.object({
      first: z.string(),
      second: z.string().transform(() => {
        throw new RangeError("u");
      }),
    }),
    z.object({ first: z.string(), second: z.custom(thenable) }),
    z.tuple([
      z.string(),
      z.number().catch(() => {
        throw new RangeError("u");
      }),
    ]),
  ];
  const inputs = [
    "x",
    "ab",
    "",
    0,
    1,
    Number.NaN,
    true,
    null,
    undefined,
    {},
    { a: "x" },
    { a: 1 },
    [],
    ["x"],
    new Map(),
    new Set(["a"]),
    "true",
    // the exposing shape: an earlier field the compiled path rejects before it reaches the throwing one
    { first: 1, second: "s" },
    { first: "s", second: "s" },
    { first: 1 },
    [1, "x"],
    ["s", "x"],
  ];
  const outcome = (fn: () => unknown) => {
    try {
      return `ok:${fn()}`;
    } catch (err) {
      return `throw:${(err as Error)?.constructor?.name}`;
    }
  };

  for (const schema of schemas) {
    let compiled: z.ZodType;
    try {
      compiled = z.compile(schema, { strict: true });
    } catch {
      continue; // refused at codegen, so there is no fast path to disagree
    }
    for (const input of inputs) {
      expect(
        outcome(() => z.validate(compiled, input)),
        `${JSON.stringify(input)} on ${schema._zod.def.type}`
      ).toBe(outcome(() => z.validate(schema, input)));
    }
  }
});

test("validate is exported from zod/mini", () => {
  expect(zm.validate(zm.string(), "a")).toBe(true);
  expect(zm.validate(zm.string(), 1)).toBe(false);
  expect(zm.validate(zm.object({ a: zm.number() }), { a: 1 })).toBe(true);
});
