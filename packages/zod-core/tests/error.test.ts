import * as z from "@zod/core";
import { expect, test } from "vitest";

test("no locale by default", () => {
  const result = z.safeParse(z.string(), 12);
  expect(result.success).toEqual(false);
  expect(result.error!.issues.length).toEqual(1);
  expect(result.error!.issues[0].message).toEqual("Invalid input");
});
