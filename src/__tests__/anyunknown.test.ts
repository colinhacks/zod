import * as z from "../index";
import { util } from "../helpers/util";

test("check any inference", () => {
  const t1 = z.any();
  t1.optional();
  t1.nullable();
  t1.toJSON();
  type t1 = z.infer<typeof t1>;
  const f1: util.AssertEqual<t1, any> = true;
  f1;
});

test("check unknown inference", () => {
  const t1 = z.unknown();
  t1.optional();
  t1.nullable();
  t1.toJSON();
  type t1 = z.infer<typeof t1>;
  const f1: util.AssertEqual<t1, unknown> = true;
  f1;
});

test("check never inference", () => {
  const t1 = z.never();
  expect(() => t1.parse(undefined)).toThrow();
  expect(() => t1.parse("asdf")).toThrow();
  expect(() => t1.parse(null)).toThrow();
});
