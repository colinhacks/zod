import { expect, test } from "vitest";
import * as z from "zod/v4-mini";

// declare module "@zod/core" {
//   interface $ZodType {
//     /** @deprecated */
//     fun(): string;
//   }
// }

test("prototype extension", () => {
  z.ZodMiniType.prototype.fun = function () {
    return "fun";
  };

  // should pass
  const result = (z.string() as any).fun();
  expect(result).toBe("fun");
  // expectTypeOf<typeof result>().toEqualTypeOf<string>();

  // clean up
  z.ZodMiniType.prototype.fun = undefined;
});
