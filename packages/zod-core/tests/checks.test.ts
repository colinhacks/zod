import { expect, test } from "vitest";
import * as z from "../src/index.js";

// lt;
test("lt", () => {
  const a = z.number([z.lt(10)]);
  expect(z.safeParse(a, 9).success).toEqual(true);
  expect(z.safeParse(a, 9).data).toEqual(9);

  expect(z.safeParse(a, 10).success).toEqual(false);
});

// lte;
// gt;
// gte;
// maxSize;
// minSize;
// size;
// regex;
// includes;
// startsWith;
// endsWith;
// lowercase;
// uppercase;
// filename;
// fileType;
// overwrite;
// normalize;
// trim;
// toLowerCase;
// toUpperCase;
