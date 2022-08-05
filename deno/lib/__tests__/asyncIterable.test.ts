import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";
import { ZodNumber, ZodString } from "../types.ts";

const aiSchema = z.asyncIterable(
  z.object({
    name: z.string(),
    age: z.number(),
  })
);

async function asyncIterableToArray<T>(ai: AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const item of ai) {
    result.push(item);
  }
  return result;
}

test("asyncIterable inference", () => {
  type aiSchemaType = z.infer<typeof aiSchema>;
  const t1: util.AssertEqual<
    aiSchemaType,
    AsyncIterable<{ name: string; age: number }>
  > = true;
  expect(t1).toBe(true);
});

test("asyncIterable parsing success", async () => {
  const ai = aiSchema.parse(
    (async function* () {
      yield { name: "foo", age: 1 }, yield { name: "bar", age: 2 };
    })()
  );
  expect(typeof ai[Symbol.asyncIterator]).toBe("function");

  const items = await asyncIterableToArray(ai);
  expect(items).toEqual([
    { name: "foo", age: 1 },
    { name: "bar", age: 2 },
  ]);
});

test("asyncIterable parsing success 2", () => {
  const fakeAsyncIterable = {
    [Symbol.asyncIterator]() {
      return this;
    },
  };
  aiSchema.parse(fakeAsyncIterable);
});

test("asyncIterable parsing fail", async () => {
  const bad = aiSchema.parse(
    (async function* () {
      yield { name: "Bobby", age: "10" };
    })()
  );
  return await expect(asyncIterableToArray(bad)).rejects.toBeInstanceOf(
    z.ZodError
  );
});

test("asyncIterable parsing fail 2", () => {
  const bad = () => aiSchema.parse({ [Symbol.asyncIterator]: {} });
  expect(bad).toThrow();
});

const asyncIterableFunction = z.function(z.tuple([]), aiSchema);

test("async generator function pass", async () => {
  const validatedFunction = asyncIterableFunction.implement(async function* () {
    yield { name: "jimmy", age: 14 };
  });
  await expect(asyncIterableToArray(validatedFunction())).resolves.toEqual([
    {
      name: "jimmy",
      age: 14,
    },
  ]);
});

test("async generator function fail", async () => {
  const validatedFunction = asyncIterableFunction.implement(async function* () {
    yield "hello" as any;
  });
  await expect(
    asyncIterableToArray(validatedFunction())
  ).rejects.toBeInstanceOf(z.ZodError);
});

test("async parsing", async () => {
  const res = await z.asyncIterable(z.number()).parseAsync(
    (async function* () {
      yield 12;
    })()
  );
  expect(typeof res[Symbol.asyncIterator]).toBe("function");
});

test("asyncIterable item schema", () => {
  expect(aiSchema.item.shape.name).toBeInstanceOf(ZodString);
  expect(aiSchema.item.shape.age).toBeInstanceOf(ZodNumber);
});
