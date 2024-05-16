// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import {
  ZodFailure,
  isAborted,
  isValid,
  SyncParseReturnType,
} from "../helpers/parseUtil.ts";

test("parseUtil isInvalid should use structural typing", () => {
  // Test for issue #556: https://github.com/colinhacks/zod/issues/556
  const aborted: SyncParseReturnType = new ZodFailure([]);
  const valid: SyncParseReturnType = { status: "valid", value: "whatever" };

  expect(isAborted(aborted)).toBe(true);
  expect(isAborted(valid)).toBe(false);

  expect(isValid(aborted)).toBe(false);
  expect(isValid(valid)).toBe(true);
});
