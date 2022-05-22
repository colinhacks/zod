// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

test("instanceof", async () => {
  class Test {}
  class Subtest extends Test {}

  const TestSchema = z.instanceof(Test);
  const SubtestSchema = z.instanceof(Subtest);

  TestSchema.parse(new Test());
  TestSchema.parse(new Subtest());
  SubtestSchema.parse(new Subtest());

  await expect(() => SubtestSchema.parse(new Test())).toThrow(
    /Input not instance of Subtest/
  );
  await expect(() => TestSchema.parse(12)).toThrow(
    /Input not instance of Test/
  );

  const f1: util.AssertEqual<Test, z.infer<typeof TestSchema>> = true;
  expect(f1).toBeTruthy();
});

test("instanceof fatal", () => {
  const schema = z.instanceof(Date).refine((d) => d.toString());
  const res = schema.safeParse(null);
  expect(res.success).toBe(false);
});
