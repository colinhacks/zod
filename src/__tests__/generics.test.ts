// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";
import { util } from "../types/utils";

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

test("assignability", () => {
  const createSchemaAndParse = <K extends string, VS extends z.ZodString>(
    key: K,
    valueSchema: VS,
    data: unknown
  ) => {
    const schema = z.object({
      [key]: valueSchema,
    });
    const parsed = schema.parse(data);
    const inferred: z.infer<z.ZodObject<{ [k in K]: VS }>> = parsed;
    return inferred;
  };
  createSchemaAndParse("foo", z.string(), { foo: "" });
});
