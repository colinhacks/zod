import { expect, test } from "vitest";
import * as z from "zod/v4";

test("English locale uses 'exactly' for .length() errors (issue #6176)", () => {
  z.setErrorMap(z.locales.en().localeError);

  const result = z.string().length(4).safeParse("abc");
  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues[0].message).toBe("Too small: expected string to have exactly 4 characters");
  }

  const result2 = z.string().length(4).safeParse("abcde");
  expect(result2.success).toBe(false);
  if (!result2.success) {
    expect(result2.error.issues[0].message).toBe("Too big: expected string to have exactly 4 characters");
  }

  const result3 = z.string().min(3).safeParse("ab");
  expect(result3.success).toBe(false);
  if (!result3.success) {
    expect(result3.error.issues[0].message).toBe("Too small: expected string to have >=3 characters");
  }
});
