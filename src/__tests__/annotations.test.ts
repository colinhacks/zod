// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const isPii = Symbol("isPii");
const annotations = { [isPii]: true };

test("passing `annotations` to schema should add annotations", () => {
  expect(z.string({ annotations }).annotations).toEqual(annotations);
  expect(z.number({ annotations }).annotations).toEqual(annotations);
  expect(z.boolean({ annotations }).annotations).toEqual(annotations);
});

test("`.annotate` should add an annotations", () => {
  expect(z.string().annotate(isPii, true).annotations).toEqual(annotations);
  expect(z.number().annotate(isPii, true).annotations).toEqual(annotations);
  expect(z.boolean().annotate(isPii, true).annotations).toEqual(annotations);
});

test("annotations should carry over to chained schemas", () => {
  const schema = z.string({ annotations });
  expect(schema.annotations).toEqual(annotations);
  expect(schema.optional().annotations).toEqual(annotations);
  expect(schema.optional().nullable().default("default").annotations).toEqual(
    annotations
  );
});
