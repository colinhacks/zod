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
    ["mini string", zm.string()],
    ["mini object", zm.object({ a: zm.string() })],
  ];

  const over = cases
    .map(([name, schema]) => [name, Reflect.ownKeys(schema).length] as const)
    .filter(([, count]) => count > MAX_OWN_PROPS);

  expect(over).toEqual([]);
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

test("caching a lazy member preserves its original enumerability", () => {
  const schema = z.string();

  // Methods were enumerable own properties before they moved to the prototype,
  // so touching one still surfaces it to `Object.keys`.
  void schema.parse;
  void schema.optional;
  expect(Object.keys(schema)).toContain("parse");
  expect(Object.keys(schema)).toContain("optional");

  // `~standard` never was an own data property, so caching it must not add it
  // to `Object.keys` or to `JSON.stringify` of a schema.
  void schema["~standard"];
  expect(Object.keys(schema)).not.toContain("~standard");
  expect(JSON.stringify(schema)).not.toContain("~standard");

  // An explicit assignment behaves like one, as before.
  const other: any = z.string();
  other["~standard"] = { vendor: "x" };
  expect(Object.keys(other)).toContain("~standard");
});

test("_def stays read-only", () => {
  expect(() => {
    (z.string() as any)._def = {};
  }).toThrow(TypeError);
  expect(() => {
    (z.function({ input: [z.string()], output: z.number() }) as any)._def = {};
  }).toThrow(TypeError);
  const schema = z.string();
  expect(schema._def).toBe(schema._zod.def);
  expect(z.object({ a: z.string() })._def.type).toEqual("object");
});

test("deferred initializers are released after construction", () => {
  expect(z.string()._zod.deferred).toEqual(undefined);
  expect(z.object({ a: z.string() })._zod.deferred).toEqual(undefined);
});
