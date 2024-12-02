// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

//import { util } from "../helpers/util";
import * as z from "../index.ts";

const params = { strict: false };

const minTwoStr = z.string().array().min(2);
const optionalMinTwoStr = z.string().array().min(2).optional();
const variadicTuple = z.tuple([z.string(), z.string()]).rest(z.number());
const optionalProp = z.object({
  id: z.number().optional(),
  username: z.string(),
});

test("failing validations", () => {
  expect(() => minTwoStr.parse(["a"])).toThrow();
  expect(() => minTwoStr.parse(["a", 1, 1, 1])).toThrow();
  expect(() => variadicTuple.parse(["a", 1, 2, 3, "c"], params)).toThrow();
  expect(() => optionalProp.parse({ username: null, id: 2 }, params)).toThrow();
});

test("validation of dirty success", () => {
  const r1 = minTwoStr.safeParse(["a", "b", 123], params);
  expect(r1.success).toEqual(true);
  expect(r1.data).toEqual(["a", "b"]);
  expect(r1.error).toBeInstanceOf(z.ZodError);
  expect(r1.error?.issues?.length).toEqual(1);

  const r2 = minTwoStr.safeParse(["a", 123, "b"], params);
  expect(r2.success).toEqual(true);
  expect(r2.data).toEqual(["a", "b"]);
  expect(r2.error).toBeInstanceOf(z.ZodError);
  expect(r2.error?.issues?.length).toEqual(1);

  const r3 = optionalMinTwoStr.safeParse(["a"], params);
  expect(r3.success).toEqual(true);
  expect(r3.data).toEqual(undefined);
  expect(r3.error).toBeInstanceOf(z.ZodError);
  expect(r3.error?.issues?.length).toEqual(1);

  const r4 = variadicTuple.safeParse(["a", "b", 1, 2, 3, "c"], params);
  expect(r4.success).toEqual(true);
  expect(r4.data).toEqual(["a", "b", 1, 2, 3]);
  expect(r4.error).toBeInstanceOf(z.ZodError);
  expect(r4.error?.issues?.length).toEqual(1);

  const r5 = optionalProp.safeParse({ username: "foo", id: "1111" }, params);
  expect(r5.success).toEqual(true);
  expect(r5.data).toEqual({ username: "foo" });
  expect(r5.error).toBeInstanceOf(z.ZodError);
  expect(r5.error?.issues?.length).toEqual(1);
});
