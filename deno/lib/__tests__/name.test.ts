// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import * as z from "../index.ts";

test("name", () => {
  const schema: any = z.string();
  const NAME = "asdlfkjasdf";
  expect(schema.named(NAME).name).toEqual(NAME);
});
