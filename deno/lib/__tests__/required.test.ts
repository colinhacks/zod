// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

const requiredUndefined = z.undefined().required();
const requiredVoid = z.void().required();
const requiredOptional = z.string().optional().required();
const requiredOptionalOptional = z.string().optional().optional().required();
const requiredNullable = z.string().nullable().required();
const requiredNullish = z.string().nullish().required();
const requiredStringWithDefault = z.string().default("asdf").required();
const requiredStringWithCatch = z.string().catch("asdf").required();

const requiredObj = z
  .object({
    a: z.string().optional(),
    b: z.number().nullable(),
    c: z.bigint().nullish(),
  })
  .required();
const requiredObjWithMask = z
  .object({
    a: z.string().optional(),
    b: z.number().nullable(),
    c: z.bigint().nullish(),
  })
  .required({ a: true, b: true });

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
  // Obj
  util.assertEqual<
    z.infer<typeof requiredObj>,
    { a: string; b: number | null; c: bigint | null }
  >(true);
  util.assertEqual<
    z.infer<typeof requiredObjWithMask>,
    { a: string; b: number | null; c?: bigint | null | undefined }
  >(true);
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
  expect(() =>
    requiredObj.parse({
      a: undefined,
      b: null,
      c: undefined,
    })
  ).toThrow();
  expect(() =>
    requiredObjWithMask.parse({
      a: undefined,
      b: null,
      c: undefined,
    })
  ).toThrow();
});

test("passes", () => {
  const optionalRequired = z.optional(z.required(z.string()));
  const requiredWithDefault = z.required(z.string()).default("asdf");
  optionalRequired.parse(undefined);
  requiredWithDefault.parse(undefined);
  requiredObjWithMask.parse({
    a: "asdf",
    b: null,
    c: undefined,
  });
});
