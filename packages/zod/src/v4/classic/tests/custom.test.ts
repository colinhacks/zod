import { expect, test } from "vitest";

import * as z from "zod/v4";

test("passing validations", () => {
  const example1 = z.custom<number>((x) => typeof x === "number");
  example1.parse(1234);
  expect(() => example1.parse({})).toThrow();
});

test("string params", () => {
  const example1 = z.custom<number>((x) => typeof x !== "number", "customerr");
  const result = example1.safeParse(1234);
  expect(result.success).toEqual(false);
  expect(JSON.stringify(result.error).includes("customerr")).toEqual(true);
});

test("instanceof", () => {
  const fn = (value: string) => Uint8Array.from(Buffer.from(value, "base64"));

  // Argument of type 'ZodCustom<Uint8Array<ArrayBuffer>, unknown>' is not assignable to parameter of type '$ZodType<any, Uint8Array<ArrayBuffer>>'.
  z.string().transform(fn).pipe(z.instanceof(Uint8Array));
});
