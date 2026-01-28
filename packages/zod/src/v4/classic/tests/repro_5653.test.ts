import { expect, test } from "vitest";
import { z } from "../index.js";

test("superRefine on optional field should run even if field is undefined", () => {
  const schema = z.object({
    field: z
      .any()
      .optional()
      .superRefine((_val: any, ctx: z.RefinementCtx) => {
        ctx.addIssue({
          code: "custom",
          message: "This validation should fail",
        });
      }),
  });

  expect(() => schema.parse({})).toThrow("This validation should fail");
  expect(() => schema.parse({ field: undefined })).toThrow("This validation should fail");
});

test("superRefine on optional standalone should run on undefined", () => {
  const worksOutsideObject = z
    .any()
    .optional()
    .superRefine((_val: any, ctx: z.RefinementCtx) => {
      ctx.addIssue({
        code: "custom",
        message: "This validation should fail",
      });
    });

  expect(() => worksOutsideObject.parse(undefined)).toThrow("This validation should fail");
});
