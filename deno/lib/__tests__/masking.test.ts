// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("masking test", () => {});

test("require", () => {
  const baseSchema = z.object({
    firstName: z.string(),
    middleName: z.string().optional(),
    lastName: z.union([z.undefined(), z.string()]),
    otherName: z.union([z.string(), z.undefined(), z.string()]),
  });
  baseSchema;
  // const reqBase = baseSchema.require();
  // const ewr = reqBase.shape;
  // expect(ewr.firstName).toBeInstanceOf(z.ZodString);
  // expect(ewr.middleName).toBeInstanceOf(z.ZodString);
  // expect(ewr.lastName).toBeInstanceOf(z.ZodString);
  // expect(ewr.otherName).toBeInstanceOf(z.ZodUnion);
});
