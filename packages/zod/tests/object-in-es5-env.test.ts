// @ts-ignore TS6133
import { expect, test } from "vitest";

import * as z from "../src/index.js";

const RealSet = Set;
const RealMap = Map;
const RealDate = Date;

test("doesn’t throw when Date is undefined", () => {
  (globalThis as any).Date = undefined;
  const result = z.object({}).safeParse({});
  expect(result.success).toEqual(true);
  globalThis.Date = RealDate;
});

test("doesn’t throw when Set is undefined", () => {
  (globalThis as any).Set = undefined;
  const result = z.object({}).safeParse({});
  expect(result.success).toEqual(true);
  globalThis.Set = RealSet;
});

test("doesn’t throw when Map is undefined", () => {
  (globalThis as any).Map = undefined;
  const result = z.object({}).safeParse({});
  expect(result.success).toEqual(true);
  globalThis.Map = RealMap;
});
