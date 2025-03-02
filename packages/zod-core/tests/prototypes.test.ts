import * as z from "@zod/core";
import { expect, expectTypeOf, test } from "vitest";

// declare module "@zod/core" {
//   interface $ZodType {
//     /** @deprecated */
//     fun(): string;
//   }
// }

// test("prototype extension", () => {
//   z.$ZodType.prototype.fun = function () {
//     return "fun";
//   };

//   // should pass
//   const result = z.string().fun();
//   expect(result).toBe("fun");
//   expectTypeOf<z.infer<typeof result>>().toEqualTypeOf<string>();

//   // clean up
//   z.$ZodType.prototype.fun = undefined;
// });
