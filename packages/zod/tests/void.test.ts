import * as core from "@zod/core";
import * as util from "@zod/core/util";

import { expect, test } from "vitest";
import * as z from "zod";
test("void", () => {
  const v = z.void();
  v.parse(undefined);

  expect(() => v.parse(null)).toThrow();
  expect(() => v.parse("")).toThrow();

  type v = z.infer<typeof v>;
  util.assertEqual<v, void>(true);
});
