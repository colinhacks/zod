// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

const requiredUndefined = z.required(z.undefined());
const requiredVoid = z.required(z.void());
const requiredOptional = z.required(z.string().optional());
const requiredOptionalOptional = z.required(z.string().optional().optional());
const requiredNullable = z.required(z.string().nullable());
const requiredNullish = z.required(z.string().nullish());
const requiredStringWithDefault = z.required(z.string().default("asdf"));
const requiredStringWithCatch = z.required(z.string().catch("asdf"));

test("inference", () => {
  // Input
  util.assertEqual<z.input<typeof requiredUndefined>, never>(true);
  util.assertEqual<z.input<typeof requiredVoid>, void>(true);
  util.assertEqual<z.input<typeof requiredOptional>, string>(true);
  util.assertEqual<z.input<typeof requiredOptionalOptional>, string>(true);
  util.assertEqual<z.input<typeof requiredNullable>, string | null>(true);
  util.assertEqual<z.input<typeof requiredNullish>, string | null>(true);
  util.assertEqual<z.input<typeof requiredStringWithDefault>, string>(true);
  util.assertEqual<z.input<typeof requiredStringWithCatch>, string>(true);
  // Output
  util.assertEqual<z.output<typeof requiredUndefined>, never>(true);
  util.assertEqual<z.output<typeof requiredVoid>, void>(true);
  util.assertEqual<z.output<typeof requiredOptional>, string>(true);
  util.assertEqual<z.output<typeof requiredOptionalOptional>, string>(true);
  util.assertEqual<z.output<typeof requiredNullable>, string | null>(true);
  util.assertEqual<z.output<typeof requiredNullish>, string | null>(true);
  util.assertEqual<z.output<typeof requiredStringWithDefault>, string>(true);
  util.assertEqual<z.output<typeof requiredStringWithCatch>, string>(true);
});

test("fails", () => {
  expect(() => requiredUndefined.parse(undefined)).toThrow();
  expect(() => requiredVoid.parse(undefined)).toThrow();
  expect(() => requiredOptional.parse(undefined)).toThrow();
  expect(() => requiredOptionalOptional.parse(undefined)).toThrow();
  expect(() => requiredNullable.parse(undefined)).toThrow();
  expect(() => requiredNullish.parse(undefined)).toThrow();
  expect(() => requiredStringWithDefault.parse(undefined)).toThrow();
  expect(() => requiredStringWithCatch.parse(undefined)).toThrow();
});

test("passes", () => {
  const optionalRequired = z.optional(z.required(z.string()));
  const requiredWithDefault = z.required(z.string()).default("asdf");
  optionalRequired.parse(undefined);
  requiredWithDefault.parse(undefined);
});
