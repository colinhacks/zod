import * as z from "../index";
import { util } from "../helpers/util";

const promSchema = z.promise(
  z.object({
    name: z.string(),
    age: z.number(),
  })
);

test("promise inference", () => {
  type promSchemaType = z.infer<typeof promSchema>;
  const t1: util.AssertEqual<
    promSchemaType,
    Promise<{ name: string; age: number }>
  > = true;
  t1;
});

test("promise parsing success", async () => {
  const pr = promSchema.parse(Promise.resolve({ name: "Bobby", age: 10 }));
  expect(pr).toBeInstanceOf(Promise);
  const result = await pr;
  expect(typeof result).toBe("object");
  expect(typeof result.age).toBe("number");
  expect(typeof result.name).toBe("string");
  return result;
});

test("promise parsing success 2", () => {
  promSchema.parse({ then: () => {}, catch: () => {} });
});

test("promise parsing fail", async () => {
  const bad = promSchema.parse(Promise.resolve({ name: "Bobby", age: "10" }));
  // return await expect(bad).resolves.toBe({ name: 'Bobby', age: '10' });
  return await expect(bad).rejects.toBeInstanceOf(Error);
  // done();
});

test("promise parsing fail 2", async () => {
  const failPromise = promSchema.parse(
    Promise.resolve({ name: "Bobby", age: "10" })
  );
  return await expect(failPromise).rejects.toBeInstanceOf(Error);
  // done();/z
});

test("promise parsing fail", () => {
  const bad = () => promSchema.parse({ then: () => {}, catch: {} });
  expect(bad).toThrow();
});

// test('sync promise parsing', () => {
//   expect(() => z.promise(z.string()).parse(Promise.resolve('asfd'))).toThrow();
// });

const asyncFunction = z.function(z.tuple([]), promSchema);

test("async function pass", async () => {
  const validatedFunction = asyncFunction.implement(async () => {
    return { name: "jimmy", age: 14 };
  });
  return await expect(validatedFunction()).resolves.toEqual({
    name: "jimmy",
    age: 14,
  });
});

test("async function fail", async () => {
  const validatedFunction = asyncFunction.implement(() => {
    return Promise.resolve("asdf" as any);
  });
  return await expect(validatedFunction()).rejects.toBeInstanceOf(Error);
});

test("async promise parsing", () => {
  const res = z.promise(z.number()).parseAsync(Promise.resolve(12));
  expect(res).toBeInstanceOf(Promise);
});
