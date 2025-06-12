import { expect, test, vi } from "vitest";
import * as z from "zod/v4";

test("no throw when navigator.userAgent is undefined", () => {
  vi.stubGlobal("navigator", {
    product: "React Native",
  });

  expect(() =>
    z.object({
      name: z.string(),
    })
  ).not.toThrowError();
});
