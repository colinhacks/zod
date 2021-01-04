// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { crazySchema } from "../crazySchema.ts";
import * as z from "../index.ts";

test("ZodCodeGenerator", () => {
  const gen = new z.ZodCodeGenerator();
  gen.generate(crazySchema);
  gen.dump();
});
