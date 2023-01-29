// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const description = "a description";

test("passing `description` to schema should add a description", () => {
  expect(z.string({ description }).description).toEqual(description);
  expect(z.number({ description }).description).toEqual(description);
  expect(z.boolean({ description }).description).toEqual(description);
});

test("`.describe` should add a description", () => {
  expect(z.string().describe(description).description).toEqual(description);
  expect(z.number().describe(description).description).toEqual(description);
  expect(z.boolean().describe(description).description).toEqual(description);
});

test("description should carry over to chained schemas", () => {
  const schema = z.string({ description });
  expect(schema.description).toEqual(description);
  expect(schema.optional().description).toEqual(description);
  expect(schema.optional().nullable().default("default").description).toEqual(
    description
  );
});
