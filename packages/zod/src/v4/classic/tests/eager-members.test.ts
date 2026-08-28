import { expect, test, vi } from "vitest";
import * as z from "zod/v4";
import { Fixture } from "./eager-members.fixture.js";

// the suite pins the lazy layout in scripts/pin-member-layout.ts; this file runs the eager one a test runner turns on, from before the first schema is built
vi.hoisted(() => {
  const g = globalThis as any;
  g.__zod_globalConfig ??= {};
  g.__zod_globalConfig.eager = true;
});
vi.mock("./eager-members.fixture.js");

test("vi.mock automocks a schema's methods", () => {
  expect(vi.isMockFunction(Fixture.safeParse)).toBe(true);
  vi.mocked(Fixture.safeParse).mockReturnValue({ success: true, data: { content: "mocked" } });
  expect(Fixture.safeParse(1)).toEqual({ success: true, data: { content: "mocked" } });
});

test("methods are hidden own bound properties and the schema still compares equal", () => {
  const schema = z.object({ a: z.string() });
  const desc = Object.getOwnPropertyDescriptor(schema, "safeParse")!;
  expect(typeof desc.value).toBe("function");
  expect(desc.enumerable).toBe(false);
  expect(Object.keys(schema)).not.toContain("safeParse");
  expect(schema).toEqual(z.object({ a: z.string() }));

  const { parse, optional } = schema;
  expect(parse({ a: "x" })).toEqual({ a: "x" });
  expect(optional()).toBeInstanceOf(z.ZodOptional);
  expect(schema.spa).toBe(schema.safeParseAsync);

  const spy = vi.spyOn(schema, "safeParse").mockReturnValue({ success: true, data: { a: "mocked" } });
  expect(schema.safeParse({})).toEqual({ success: true, data: { a: "mocked" } });
  spy.mockRestore();
  expect(schema.safeParse({}).success).toBe(false);
});

test("a subclass keeps its override", () => {
  class Custom extends z.ZodString {
    override parse(..._args: unknown[]): any {
      return "override";
    }
  }
  const custom = new Custom(z.string()._zod.def);
  expect(custom.parse("x")).toBe("override");
  expect(custom.safeParse("x")).toEqual({ success: true, data: "x" });
});
