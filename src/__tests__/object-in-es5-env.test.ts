import { expect, test } from "@jest/globals";

import * as z from "../index";

const RealSet = Set;
const RealMap = Map;
const RealDate = Date;

afterEach(() => {
  global.Set = RealSet;
  global.Map = RealMap;
  global.Date = RealDate;
});

test("doesn’t throw when Date is undefined", () => {
  delete (global as any).Date;
  const result = z.object({}).safeParse({});
  expect(result.success).toEqual(true);
});

test("doesn’t throw when Set is undefined", () => {
  delete (global as any).Set;
  const result = z.object({ }).safeParse({});
  expect(result.success).toEqual(true);
});


test("doesn’t throw when Map is undefined", () => {
  delete (global as any).Map;
  const result = z.object({}).safeParse({});
  expect(result.success).toEqual(true);
});

