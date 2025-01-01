import { expect, test } from "vitest";
import * as z from "../src/index.js";

// lt;
test("z.lt", () => {
  const a = z.number([z.lt(10)]);
  expect(z.safeParse(a, 9).success).toEqual(true);
  expect(z.safeParse(a, 9).data).toEqual(9);
  expect(z.safeParse(a, 10).success).toEqual(false);
});

// lte;
test("z.lte", () => {
  const a = z.number([z.lte(10)]);
  expect(z.safeParse(a, 10).success).toEqual(true);
  expect(z.safeParse(a, 10).data).toEqual(10);
  expect(z.safeParse(a, 11).success).toEqual(false);
});

// min;
test("z.max", () => {
  const a = z.number([z.max(10)]);
  expect(z.safeParse(a, 10).success).toEqual(true);
  expect(z.safeParse(a, 10).data).toEqual(10);
  expect(z.safeParse(a, 11).success).toEqual(false);
});

// gt;
test("z.gt", () => {
  const a = z.number([z.gt(10)]);
  expect(z.safeParse(a, 11).success).toEqual(true);
  expect(z.safeParse(a, 11).data).toEqual(11);
  expect(z.safeParse(a, 10).success).toEqual(false);
});

// gte;
test("z.gte", () => {
  const a = z.number([z.gte(10)]);
  expect(z.safeParse(a, 10).success).toEqual(true);
  expect(z.safeParse(a, 10).data).toEqual(10);
  expect(z.safeParse(a, 9).success).toEqual(false);
});

// min;
test("z.min", () => {
  const a = z.number([z.min(10)]);
  expect(z.safeParse(a, 10).success).toEqual(true);
  expect(z.safeParse(a, 10).data).toEqual(10);
  expect(z.safeParse(a, 9).success).toEqual(false);
});

// maxSize;
test("z.maxSize", () => {
  const a = z.array(z.string()).check(z.maxSize(3));
  expect(z.safeParse(a, ["a", "b", "c"]).success).toEqual(true);
  expect(z.safeParse(a, ["a", "b", "c", "d"]).success).toEqual(false);
});

// minSize;
test("z.minSize", () => {
  const a = z.array(z.string()).check(z.minSize(3));
  expect(z.safeParse(a, ["a", "b"]).success).toEqual(false);
  expect(z.safeParse(a, ["a", "b", "c"]).success).toEqual(true);
});

// size;
test("z.minSize", () => {
  const a = z.array(z.string()).check(z.size(3));
  expect(z.safeParse(a, ["a", "b"]).success).toEqual(false);
  expect(z.safeParse(a, ["a", "b", "c"]).success).toEqual(true);
  expect(z.safeParse(a, ["a", "b", "c", "d"]).success).toEqual(false);
});

// regex;
test("z.regex", () => {
  const a = z.string([z.regex(/^aaa$/)]);
  expect(z.safeParse(a, "aaa")).toMatchObject({ success: true, data: "aaa" });
  expect(z.safeParse(a, "aa")).toMatchObject({ success: false });
});

// includes;
test("z.includes", () => {
  const a = z.string([z.includes("asdf")]);
  z.parse(a, "qqqasdfqqq");
  z.parse(a, "asdf");
  z.parse(a, "qqqasdf");
  z.parse(a, "asdfqqq");
  expect(z.safeParse(a, "qqq")).toMatchObject({ success: false });
});

// startsWith;
test("z.startsWith", () => {
  const a = z.string([z.startsWith("asdf")]);
  z.parse(a, "asdf");
  z.parse(a, "asdfqqq");
  expect(z.safeParse(a, "qqq")).toMatchObject({ success: false });
});

// endsWith;
test("z.endsWith", () => {
  const a = z.string([z.endsWith("asdf")]);
  z.parse(a, "asdf");
  z.parse(a, "qqqasdf");
  expect(z.safeParse(a, "asdfqqq")).toMatchObject({ success: false });
});

// lowercase;
test("z.lowercase", () => {
  const a = z.string([z.lowercase()]);
  z.parse(a, "asdf");
  expect(z.safeParse(a, "ASDF")).toMatchObject({ success: false });
});

// uppercase;
test("z.uppercase", () => {
  const a = z.string([z.uppercase()]);
  z.parse(a, "ASDF");
  expect(z.safeParse(a, "asdf")).toMatchObject({ success: false });
});

// filename;
// fileType;
// overwrite;
test("z.overwrite", () => {
  const a = z.string([z.overwrite((val) => val.toUpperCase())]);
  expect(z.safeParse(a, "asdf")).toMatchObject({ data: "ASDF" });
});

// normalize;
// trim;
// toLowerCase;
// toUpperCase;
// property
