import { expect, test } from "vitest";
import { z } from "../../../../index.js";
import fa from "../../../locales/fa.js";

test("Persian locale - too_small errors", () => {
  z.config(fa());

  const stringResult = z.string().min(5).safeParse("abc");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("خیلی کوچک: string باید >=5 کاراکتر باشد");
  }

  const numberResult = z.number().min(10).safeParse(5);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("خیلی کوچک: number باید >=10 باشد");
  }

  const arrayResult = z.array(z.string()).min(3).safeParse(["a", "b"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("خیلی کوچک: array باید >=3 آیتم باشد");
  }

  const setResult = z
    .set(z.string())
    .min(2)
    .safeParse(new Set(["a"]));
  expect(setResult.success).toBe(false);
  if (!setResult.success) {
    expect(setResult.error.issues[0].message).toBe("خیلی کوچک: set باید >=2 آیتم باشد");
  }
});

test("Persian locale - too_big errors", () => {
  z.config(fa());

  const stringResult = z.string().max(3).safeParse("abcde");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("خیلی بزرگ: string باید <=3 کاراکتر باشد");
  }

  const numberResult = z.number().max(10).safeParse(15);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("خیلی بزرگ: number باید <=10 باشد");
  }

  const arrayResult = z.array(z.string()).max(2).safeParse(["a", "b", "c"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("خیلی بزرگ: array باید <=2 آیتم باشد");
  }
});

test("Persian locale - invalid_type errors", () => {
  z.config(fa());

  const stringResult = z.string().safeParse(123);
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("ورودی نامعتبر: می‌بایست string می‌بود، عدد دریافت شد");
  }

  const numberResult = z.number().safeParse("abc");
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("ورودی نامعتبر: می‌بایست عدد می‌بود، string دریافت شد");
  }

  const booleanResult = z.boolean().safeParse(null);
  expect(booleanResult.success).toBe(false);
  if (!booleanResult.success) {
    expect(booleanResult.error.issues[0].message).toBe("ورودی نامعتبر: می‌بایست boolean می‌بود، null دریافت شد");
  }

  const arrayResult = z.array(z.string()).safeParse({});
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("ورودی نامعتبر: می‌بایست آرایه می‌بود، object دریافت شد");
  }
});

test("Persian locale - other error cases", () => {
  z.config(fa());

  const enumResult = z.enum(["a", "b"]).safeParse("c");
  expect(enumResult.success).toBe(false);
  if (!enumResult.success) {
    expect(enumResult.error.issues[0].message).toBe('گزینه نامعتبر: می‌بایست یکی از "a"|"b" می‌بود');
  }

  const multipleResult = z.number().multipleOf(3).safeParse(10);
  expect(multipleResult.success).toBe(false);
  if (!multipleResult.success) {
    expect(multipleResult.error.issues[0].message).toBe("عدد نامعتبر: باید مضرب 3 باشد");
  }

  const strictResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "extra" });
  expect(strictResult.success).toBe(false);
  if (!strictResult.success) {
    expect(strictResult.error.issues[0].message).toBe('کلید ناشناس: "b"');
  }

  const strictMultiResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "x", c: "y" });
  expect(strictMultiResult.success).toBe(false);
  if (!strictMultiResult.success) {
    expect(strictMultiResult.error.issues[0].message).toBe('کلیدهای ناشناس: "b", "c"');
  }

  const unionResult = z.union([z.string(), z.number()]).safeParse(true);
  expect(unionResult.success).toBe(false);
  if (!unionResult.success) {
    expect(unionResult.error.issues[0].message).toBe("ورودی نامعتبر");
  }

  const regexResult = z
    .string()
    .regex(/^[a-z]+$/)
    .safeParse("ABC123");
  expect(regexResult.success).toBe(false);
  if (!regexResult.success) {
    expect(regexResult.error.issues[0].message).toBe("رشته نامعتبر: باید با الگوی /^[a-z]+$/ مطابقت داشته باشد");
  }

  const startsWithResult = z.string().startsWith("hello").safeParse("world");
  expect(startsWithResult.success).toBe(false);
  if (!startsWithResult.success) {
    expect(startsWithResult.error.issues[0].message).toBe('رشته نامعتبر: باید با "hello" شروع شود');
  }

  const endsWithResult = z.string().endsWith("world").safeParse("hello");
  expect(endsWithResult.success).toBe(false);
  if (!endsWithResult.success) {
    expect(endsWithResult.error.issues[0].message).toBe('رشته نامعتبر: باید با "world" تمام شود');
  }
});
