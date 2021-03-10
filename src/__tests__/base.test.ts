// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("type guard", () => {
  const stringToNumber = z.string().transform((arg) => arg.length);

  const s1 = z.object({
    stringToNumber,
  });
  type t1 = z.input<typeof s1>;

  const data: any = "asdf";
  const parsed = s1.safeParse(data);
  if (parsed.success) {
    const f1: util.AssertEqual<typeof data, t1> = true;
    f1;
  }
});

test("test this binding", () => {
  const callback = (predicate: (val: string) => boolean) => {
    return predicate("hello");
  };

  expect(callback((value) => z.string().safeParse(value).success)).toBe(true); // true
  expect(callback((value) => z.string().safeParse(value).success)).toBe(true); // true
});
