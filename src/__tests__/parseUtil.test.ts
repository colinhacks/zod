// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import {
  ZodFailure,
  isAborted,
  isValid,
  type SyncParseReturnType,
} from "../helpers/parseUtil";

test("parseUtil isInvalid should use structural typing", () => {
  // Test for issue #556: https://github.com/colinhacks/zod/issues/556
  const aborted: SyncParseReturnType = new ZodFailure([]);
  const valid: SyncParseReturnType = { status: "valid", value: "whatever" };

  expect(isAborted(aborted)).toBe(true);
  expect(isAborted(valid)).toBe(false);

  expect(isValid(aborted)).toBe(false);
  expect(isValid(valid)).toBe(true);
});
