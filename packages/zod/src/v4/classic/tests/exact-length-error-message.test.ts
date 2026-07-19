import { describe, expect, test } from "vitest";
import * as z from "../../index.js";

describe("exact-length error messages", () => {
  test("string().length() too_big includes 'exactly'", () => {
    const result = z.string().length(5).safeParse("123456");
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe("Too big: expected string to have exactly 5 characters");
  });

  test("string().length() too_small includes 'exactly'", () => {
    const result = z.string().length(5).safeParse("1234");
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe("Too small: expected string to have exactly 5 characters");
  });

  test("array().length() too_big includes 'exactly'", () => {
    const result = z.array(z.string()).length(2).safeParse(["a", "b", "c"]);
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe("Too big: expected array to have exactly 2 items");
  });

  test("array().length() too_small includes 'exactly'", () => {
    const result = z.array(z.string()).length(2).safeParse(["a"]);
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe("Too small: expected array to have exactly 2 items");
  });

  test("string().min() range messages are unaffected", () => {
    const result = z.string().min(5).safeParse("ab");
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe("Too small: expected string to have >=5 characters");
  });

  test("string().max() range messages are unaffected", () => {
    const result = z.string().max(5).safeParse("abcdefgh");
    expect(result.success).toBe(false);
    expect(result.error!.issues[0].message).toBe("Too big: expected string to have <=5 characters");
  });
});
