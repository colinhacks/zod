import { expect, test } from "vitest";
import * as z from "zod";

test("test this binding", () => {
  const parse = z.string().parse;
  expect(parse("asdf")).toBe("asdf");
});
