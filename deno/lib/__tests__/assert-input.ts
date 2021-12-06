// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

const schema = z.object({
  foo: z.string().transform(Number),
});

test("assertInput: valid", () => {
  const valid = {
    foo: "42",
  };
  z.assertInput(schema, valid);

  const f1: util.AssertEqual<typeof valid, z.input<typeof schema>> = true;
  f1;
});

test("assertInput: invalid", () => {
  const invalid = {
    foo: 42,
  };
  z.assertInput(schema, invalid);

  const f1: util.AssertEqual<typeof invalid, z.input<typeof schema>> = false;
  f1;
});
