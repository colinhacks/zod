import { expect, test } from "vitest";
import * as z from "../src/index.js";

test("test this binding", () => {
  const parse = z.string().parse;
  expect(parse("asdf")).toBe("asdf");
});
