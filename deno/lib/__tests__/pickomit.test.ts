// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

const fish = z.object({
  name: z.string(),
  age: z.number(),
  nested: z.object({}),
});

test("pick type inference", () => {
  const nameonlyFish = fish.pick({ name: true });
  type nameonlyFish = z.infer<typeof nameonlyFish>;
  const f1: util.AssertEqual<nameonlyFish, { name: string }> = true;
  f1;
});

test("pick parse - success", () => {
  const nameonlyFish = fish.pick({ name: true });
  nameonlyFish.parse({ name: "bob" });
});

test("pick parse - fail", () => {
  fish.pick({ name: true }).parse({ name: "12" } as any);
  fish.pick({ name: true }).parse({ name: "bob", age: 12 } as any);
  fish.pick({ age: true }).parse({ age: 12 } as any);

  const nameonlyFish = fish.pick({ name: true }).strict();
  const bad1 = () => nameonlyFish.parse({ name: 12 } as any);
  const bad2 = () => nameonlyFish.parse({ name: "bob", age: 12 } as any);
  const bad3 = () => nameonlyFish.parse({ age: 12 } as any);

  expect(bad1).toThrow();
  expect(bad2).toThrow();
  expect(bad3).toThrow();
});

test("omit type inference", () => {
  const nonameFish = fish.omit({ name: true });
  type nonameFish = z.infer<typeof nonameFish>;
  const f1: util.AssertEqual<nonameFish, { age: number; nested: {} }> = true;
  f1;
});

test("omit parse - success", () => {
  const nonameFish = fish.omit({ name: true });
  nonameFish.parse({ age: 12, nested: {} });
});

test("omit parse - fail", () => {
  const nonameFish = fish.omit({ name: true });
  const bad1 = () => nonameFish.parse({ name: 12 } as any);
  const bad2 = () => nonameFish.parse({ age: 12 } as any);
  const bad3 = () => nonameFish.parse({} as any);

  expect(bad1).toThrow();
  expect(bad2).toThrow();
  expect(bad3).toThrow();
});

test("nonstrict inference", () => {
  const laxfish = fish.nonstrict().pick({ name: true });
  type laxfish = z.infer<typeof laxfish>;
  const f1: util.AssertEqual<laxfish, { [k: string]: any; name: string }> =
    true;
  f1;
});

test("nonstrict parsing - pass", () => {
  const laxfish = fish.nonstrict().pick({ name: true });
  laxfish.parse({ name: "asdf", whatever: "asdf" });
  laxfish.parse({ name: "asdf", age: 12, nested: {} });
});

test("nonstrict parsing - fail", () => {
  const laxfish = fish.nonstrict().pick({ name: true });
  const bad = () => laxfish.parse({ whatever: "asdf" } as any);
  expect(bad).toThrow();
});

test("pick a nonexistent key", () => {
  const schema = z.object({
    a: z.string(),
    b: z.number(),
  });

  const pickedSchema = schema.pick({
    a: true,
    doesntExist: true,
  });

  pickedSchema.parse({
    a: "value",
  });
});
