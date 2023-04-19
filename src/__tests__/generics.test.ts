// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("generics", () => {
  async function stripOuter<TData extends z.ZodTypeAny>(
    schema: TData,
    data: unknown
  ) {
    return z
      .object({
        nested: schema, // as z.ZodTypeAny,
      })
      .transform((data) => {
        return data.nested!;
      })
      .parse({ nested: data });
  }

  const result = stripOuter(z.object({ a: z.string() }), { a: "asdf" });
  util.assertEqual<typeof result, Promise<{ a: string }>>(true);
});
