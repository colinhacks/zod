// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("name", () => {
  const schema: any = z.string();
  const NAME = "asdlfkjasdf";
  expect(schema.named(NAME).name).toEqual(NAME);
});
