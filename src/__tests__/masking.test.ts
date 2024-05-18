// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

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
