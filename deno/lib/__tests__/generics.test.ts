// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

test("generics", () => {
  async function stripOuter<TData extends z.ZodType>(
    schema: TData,
    data: unknown
  ) {
    return z
      .object({
        nested: schema, // as z.ZodType,
      })
      .transform((data) => {
        return data.nested!;
      })
      .parse({ nested: data });
  }

  const result = stripOuter(z.object({ a: z.string() }), { a: "asdf" });
  util.assertEqual<typeof result, Promise<{ a: string }>>(true);
});
