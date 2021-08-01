// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { INVALID, isInvalid } from "../helpers/parseUtil.ts";

test("parseUtil isInvalid should use structural typing", () => {
  // Test for issue #556: https://github.com/colinhacks/zod/issues/556
  const newInstance: INVALID = Object.freeze({ valid: false });
  expect(isInvalid(newInstance)).toBe(true);
  expect(isInvalid(INVALID)).toBe(true);
});
