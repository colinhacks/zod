// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";
test("void", () => {
  const v = z.void();
  v.parse(undefined);

  expect(() => v.parse(null)).toThrow();
  expect(() => v.parse("")).toThrow();

  type v = z.infer<typeof v>;
  const t1: util.AssertEqual<v, void> = true;
  t1;
});
