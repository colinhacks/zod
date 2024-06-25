// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const title = "title";

test("passing `title` to schema should add a title", () => {
  expect(z.string({ title }).title).toEqual(title);
  expect(z.number({ title }).title).toEqual(title);
  expect(z.boolean({ title }).title).toEqual(title);
});

test("`.titled` should add a description", () => {
  expect(z.string().titled(title).title).toEqual(title);
  expect(z.number().titled(title).title).toEqual(title);
  expect(z.boolean().titled(title).title).toEqual(title);
});

test("title should carry over to chained schemas", () => {
  const schema = z.string({ title });
  expect(schema.title).toEqual(title);
  expect(schema.optional().title).toEqual(title);
  expect(schema.optional().nullable().default("default").title).toEqual(
    title
  );
});
