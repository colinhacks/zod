import { expect, test } from "vitest";
import { z } from "../../../../index.js";
import ur from "../../../locales/ur.js";

test("Urdu locale - too_small errors", () => {
  z.config(ur());

  const stringResult = z.string().min(5).safeParse("abc");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("بہت چھوٹا: string کے >=5 حروف ہونے متوقع تھے");
  }

  const numberResult = z.number().min(10).safeParse(5);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("بہت چھوٹا: number کا >=10 ہونا متوقع تھا");
  }

  const arrayResult = z.array(z.string()).min(3).safeParse(["a", "b"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("بہت چھوٹا: array کے >=3 آئٹمز ہونے متوقع تھے");
  }

  const setResult = z
    .set(z.string())
    .min(2)
    .safeParse(new Set(["a"]));
  expect(setResult.success).toBe(false);
  if (!setResult.success) {
    expect(setResult.error.issues[0].message).toBe("بہت چھوٹا: set کے >=2 آئٹمز ہونے متوقع تھے");
  }
});

test("Urdu locale - too_big errors", () => {
  z.config(ur());

  const stringResult = z.string().max(3).safeParse("abcde");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("بہت بڑا: string کے <=3 حروف ہونے متوقع تھے");
  }

  const numberResult = z.number().max(10).safeParse(15);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("بہت بڑا: number کا <=10 ہونا متوقع تھا");
  }

  const arrayResult = z.array(z.string()).max(2).safeParse(["a", "b", "c"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("بہت بڑا: array کے <=2 آئٹمز ہونے متوقع تھے");
  }
});

test("Urdu locale - invalid_type errors", () => {
  z.config(ur());

  const stringResult = z.string().safeParse(123);
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("غلط ان پٹ: string متوقع تھا، نمبر موصول ہوا");
  }

  const numberResult = z.number().safeParse("abc");
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("غلط ان پٹ: نمبر متوقع تھا، string موصول ہوا");
  }

  const booleanResult = z.boolean().safeParse(null);
  expect(booleanResult.success).toBe(false);
  if (!booleanResult.success) {
    expect(booleanResult.error.issues[0].message).toBe("غلط ان پٹ: boolean متوقع تھا، نل موصول ہوا");
  }

  const arrayResult = z.array(z.string()).safeParse({});
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("غلط ان پٹ: آرے متوقع تھا، object موصول ہوا");
  }
});

test("Urdu locale - other error cases", () => {
  z.config(ur());

  const enumResult = z.enum(["a", "b"]).safeParse("c");
  expect(enumResult.success).toBe(false);
  if (!enumResult.success) {
    expect(enumResult.error.issues[0].message).toBe('غلط آپشن: "a"|"b" میں سے ایک متوقع تھا');
  }

  const multipleResult = z.number().multipleOf(3).safeParse(10);
  expect(multipleResult.success).toBe(false);
  if (!multipleResult.success) {
    expect(multipleResult.error.issues[0].message).toBe("غلط نمبر: 3 کا مضاعف ہونا چاہیے");
  }

  const strictResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "extra" });
  expect(strictResult.success).toBe(false);
  if (!strictResult.success) {
    expect(strictResult.error.issues[0].message).toBe('غیر تسلیم شدہ کی: "b"');
  }

  const strictMultiResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "x", c: "y" });
  expect(strictMultiResult.success).toBe(false);
  if (!strictMultiResult.success) {
    expect(strictMultiResult.error.issues[0].message).toBe('غیر تسلیم شدہ کیز: "b"، "c"');
  }

  const unionResult = z.union([z.string(), z.number()]).safeParse(true);
  expect(unionResult.success).toBe(false);
  if (!unionResult.success) {
    expect(unionResult.error.issues[0].message).toBe("غلط ان پٹ");
  }

  const regexResult = z
    .string()
    .regex(/^[a-z]+$/)
    .safeParse("ABC123");
  expect(regexResult.success).toBe(false);
  if (!regexResult.success) {
    expect(regexResult.error.issues[0].message).toBe("غلط سٹرنگ: پیٹرن /^[a-z]+$/ سے میچ ہونا چاہیے");
  }

  const startsWithResult = z.string().startsWith("hello").safeParse("world");
  expect(startsWithResult.success).toBe(false);
  if (!startsWithResult.success) {
    expect(startsWithResult.error.issues[0].message).toBe('غلط سٹرنگ: "hello" سے شروع ہونا چاہیے');
  }

  const endsWithResult = z.string().endsWith("world").safeParse("hello");
  expect(endsWithResult.success).toBe(false);
  if (!endsWithResult.success) {
    expect(endsWithResult.error.issues[0].message).toBe('غلط سٹرنگ: "world" پر ختم ہونا چاہیے');
  }
});
