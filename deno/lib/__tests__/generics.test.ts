// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

test("generics", () => {
  async function stripOuter<TData extends z.ZodTypeAny>(
    schema: TData,
    url: string
  ): Promise<TData["_output"]> {
    const zStrippedResponse = z
      .object({
        topLevelKey: schema,
      })
      .transform((data) => {
        return data.topLevelKey;
      });

    return fetch(url)
      .then((response) => response.json())
      .then((data) => zStrippedResponse.parse(data));
  }

  const result = stripOuter(z.number(), "");
  util.assertEqual<typeof result, Promise<number>>(true);
});
