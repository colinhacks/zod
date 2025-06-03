import { expect, test } from "vitest";
import * as z from "zod/v4";

declare module "zod/v4" {
  interface ZodType {
    /** @deprecated */
    dostuff(): string;
  }
}

test("prototype extension", () => {
  z.ZodType.prototype.dostuff = function () {
    return "stuff";
  };

  // should pass
  const result = z.string().dostuff();
  expect(result).toBe("stuff");
  // expectTypeOf<typeof result>().toEqualTypeOf<string>();

  // clean up
  z.ZodType.prototype.fun = undefined;
});
