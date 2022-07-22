// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("branded types", () => {
  const mySchema = z
    .object({
      name: z.string(),
    })
    .brand<"mySchema">();

  type MySchema = z.infer<typeof mySchema>;

  const doStuff = (arg: MySchema) => arg;
  doStuff(mySchema.parse({ name: "hello there" }));
  const f1: util.AssertEqual<
    MySchema,
    { name: string } & { [z.BRAND]: "mySchema" }
  > = true;
  f1;

  // @ts-expect-error
  doStuff({ name: "hello there!" });
});
