// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const examples = [ "an example" ];

test("passing `examples` to schema should add a examples", () => {
  expect(z.string({ examples }).examples).toEqual(examples);
  expect(z.number({ examples }).examples).toEqual(examples);
  expect(z.boolean({ examples }).examples).toEqual(examples);
});

test("`.exemplify` should add an example", () => {
  expect(z.string().exemplify(examples[0]).examples).toEqual(examples);
  expect(z.number().exemplify(examples[0]).examples).toEqual(examples);
  expect(z.boolean().exemplify(examples[0]).examples).toEqual(examples);
});

test("examples should carry over to chained schemas", () => {
  const schema = z.string({ examples });
  expect(schema.examples).toEqual(examples);
  expect(schema.optional().examples).toEqual(examples);
  expect(schema.optional().nullable().default("default").examples).toEqual(
    examples
  );
});

test("`.exemplify` should be chainable", () => {
  const schema = z.string({ examples: [123] });
  expect(schema.examples).toEqual([123]);

  schema.exemplify('example 1');
  expect(schema.examples).toEqual([123, 'example 1']);

  schema.exemplify(true);
  expect(schema.examples).toEqual([123, 'example 1', true]);

  schema.exemplify({ foo: 'bar' });
  expect(schema.examples).toEqual([123, 'example 1', true, { foo: 'bar' }]);
});
