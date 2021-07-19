// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("required & invalid validations", () => {
  const requiredMessage = "This field is required";
  const invalidMessage = "Expected number, instead of whatever you input!";

  const b = z.boolean({ invalid: invalidMessage, required: requiredMessage });
  expect(() => b.parse("false")).toThrow(invalidMessage);
  expect(() => b.parse(undefined)).toThrow(requiredMessage);
});
