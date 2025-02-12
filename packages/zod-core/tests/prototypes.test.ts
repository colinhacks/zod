import * as z from "@zod/core";
import { expect, test } from "vitest";

declare module "@zod/core" {
  interface $ZodType {
    fun(): void;
  }
}

test("prototype extension", () => {
  z.$ZodType.prototype.fun = function () {
    return "fun";
  };

  // should pass
  const result = z.string().fun();
  expect(result).toBe("fun");

  // clean up
  z.$ZodType.prototype.fun = undefined;
});
