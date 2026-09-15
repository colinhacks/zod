import { expect, test } from "vitest";
import * as z from "zod/mini";

test("no locale by default", () => {
  const result = z.safeParse(z.string(), 12);
  expect(result.success).toEqual(false);
  expect(result.error!.issues.length).toEqual(1);
  expect(result.error!.issues[0].message).toEqual("Invalid input");
});

test("error inheritance", () => {
  const e1 = z.string().safeParse(123).error!;
  expect(e1).toBeInstanceOf(z.core.$ZodError);
  expect(e1).toBeInstanceOf(Error);

  let e2: unknown;
  try {
    z.string().parse(123);
  } catch (err) {
    e2 = err;
  }
  expect(e2).toBeInstanceOf(z.core.$ZodRealError);
  expect(e2).toBeInstanceOf(Error);
});

test("a thrown error carries a stack rooted at the parse call site", () => {
  function callSite() {
    z.parse(z.string(), 123);
  }

  let thrown: unknown;
  try {
    callSite();
  } catch (err) {
    thrown = err;
  }
  expect(thrown).toBeInstanceOf(Error);
  const stack = (thrown as Error).stack!;
  expect(stack.startsWith("$ZodError: [")).toBe(true);
  expect(stack).toContain("callSite");
});
