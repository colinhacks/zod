import { expect, test } from "vitest";

import * as zm from "zod/mini";
import * as z from "zod/v4";

// V8 sizes an instance's property backing store in steps, and schema
// instances get no in-object slots (their constructor assigns nothing itself):
// 12 own properties cost 128 bytes, 13 cost 848, 21 cost 1616. Methods
// therefore live on the prototype and materialize per instance on first read.
// These bounds are what keeps a schema graph small; crossing one silently
// multiplies its memory by 6x.
const MAX_OWN_PROPS = 12;

test("schema instances stay under V8's property-count step", () => {
  const cases: Array<[string, object]> = [
    ["string", z.string()],
    ["number", z.number()],
    ["bigint", z.bigint()],
    ["boolean", z.boolean()],
    ["date", z.date()],
    ["enum", z.enum(["a", "b"])],
    ["array", z.array(z.string())],
    ["object", z.object({ a: z.string() })],
    ["record", z.record(z.string(), z.string())],
    ["map", z.map(z.string(), z.string())],
    ["set", z.set(z.string())],
    ["union", z.union([z.string(), z.number()])],
    ["optional", z.string().optional()],
    ["pipe", z.string().pipe(z.string())],
    ["email", z.email()],
  ];

  const over = cases
    .map(([name, schema]) => [name, Reflect.ownKeys(schema).length] as const)
    .filter(([, count]) => count > MAX_OWN_PROPS);

  expect(over).toEqual([]);
});

// zod/mini deliberately keeps its methods as per-instance closures. Moving
// them to the prototype would cost ~180 bytes gzipped of installer machinery,
// which is ~6% of the smallest mini bundle — too much for a package sold on
// size. Mini instances therefore sit above the step; this bound just stops
// them drifting further.
const MINI_MAX_OWN_PROPS = 14;

test("zod/mini keeps its methods per-instance, and does not grow", () => {
  const cases: Array<[string, object]> = [
    ["mini string", zm.string()],
    ["mini object", zm.object({ a: zm.string() })],
    ["mini array", zm.array(zm.string())],
  ];

  const over = cases
    .map(([name, schema]) => [name, Reflect.ownKeys(schema).length] as const)
    .filter(([, count]) => count > MINI_MAX_OWN_PROPS);

  expect(over).toEqual([]);
  // The methods must remain own properties, not inherited accessors.
  expect(Object.prototype.hasOwnProperty.call(zm.string(), "parse")).toEqual(true);
});

test("prototype-installed members survive detaching", () => {
  const schema = z.string();
  const { parse, safeParse, spa } = schema;

  expect(parse("hi")).toEqual("hi");
  expect(safeParse("hi").success).toEqual(true);
  expect(["a", "b"].map((v) => parse(v))).toEqual(["a", "b"]);
  expect(spa).toBe(schema.safeParseAsync);

  const email = schema.email;
  expect(email().safeParse("a@b.co").success).toEqual(true);
});

test("prototype-installed members can be overwritten per instance", () => {
  const schema: any = z.string();
  schema.parse = () => "overridden";

  expect(schema.parse("anything")).toEqual("overridden");
  expect(z.string().parse("untouched")).toEqual("untouched");
});

test("~standard is lazy but complete", () => {
  const schema = z.string();

  expect(Object.prototype.hasOwnProperty.call(schema, "~standard")).toEqual(false);
  expect(schema["~standard"].vendor).toEqual("zod");
  expect(schema["~standard"].version).toEqual(1);
  expect(schema["~standard"].validate("hi")).toEqual({ value: "hi" });
  expect((schema["~standard"] as any).jsonSchema.input()).toMatchObject({ type: "string" });
  // Reading it caches on the instance, so the getter runs once.
  expect(Object.prototype.hasOwnProperty.call(schema, "~standard")).toEqual(true);
});

test("deferred initializers are released after construction", () => {
  expect(z.string()._zod.deferred).toEqual(undefined);
  expect(z.object({ a: z.string() })._zod.deferred).toEqual(undefined);
});
