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

test("partial by type inference", () => {
  const optionalNameFish = fish.partialBy({ name: true });
  type optionalNameFish = z.infer<typeof optionalNameFish>;
  const f1: util.AssertEqual<
    optionalNameFish,
    { name?: string | undefined; age: number; nested: {} }
  > = true;
  f1;
});

test("partial by parse - success", () => {
  const nameOptionalFish = fish.partialBy({ name: true });
  nameOptionalFish.parse({ age: 0, nested: {} });
});

test("partial by parse - fail", () => {
  fish.partialBy({ name: true, age: true }).parse({ nested: {} } as any);
  fish
    .partialBy({ name: true })
    .parse({ name: "bob", age: 12, nested: {} } as any);
  fish.partialBy({ name: true }).parse({ age: 12, nested: {} } as any);

  const nameOptionalFish = fish.partialBy({ name: true });
  const bad1 = () =>
    nameOptionalFish.parse({ name: 12, age: 12, nested: {} } as any);
  const bad2 = () => nameOptionalFish.parse({ age: 12 } as any);

  expect(bad1).toThrow();
  expect(bad2).toThrow();
});
