// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { INVALID, isInvalid } from "../helpers/parseUtil";

test("parseUtil isInvalid should use structural typing", () => {
  // Test for issue #556: https://github.com/colinhacks/zod/issues/556
  const newInstance: INVALID = Object.freeze({ valid: false });
  expect(isInvalid(newInstance)).toBe(true);
  expect(isInvalid(INVALID)).toBe(true);
});
