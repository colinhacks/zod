// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("description", () => {
  const schema: any = z.string();
  const DESC = "asdlfkjasdf";
  expect(schema.describe(DESC).description).toEqual(DESC);
});
