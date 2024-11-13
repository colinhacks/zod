// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

const example = "an example";
const examples = [example, 1234];

test("passing `examples` to schema should add an example", () => {
  expect(z.string({ examples }).examples).toEqual(examples);
  expect(z.number({ examples }).examples).toEqual(examples);
  expect(z.boolean({ examples }).examples).toEqual(examples);
});

test("`.example` should add an example", () => {
  expect(z.string().example(example).examples).toEqual([example]);
  expect(z.number().example(example).examples).toEqual([example]);
  expect(z.boolean().example(example).examples).toEqual([example]);
});

test("`.example` should be able to be chained", () => {
  expect(z.string().example(example).example(1234).examples).toEqual(examples);
  expect(z.number().example(example).example(1234).examples).toEqual(examples);
  expect(z.boolean().example(example).example(1234).examples).toEqual(examples);
});

test("examples should carry over to chained schemas", () => {
  const schema = z.string({ examples });
  expect(schema.examples).toEqual(examples);
  expect(schema.optional().examples).toEqual(examples);
  expect(schema.optional().nullable().default("default").examples).toEqual(
    examples
  );
});
