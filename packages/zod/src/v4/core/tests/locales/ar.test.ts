import { expect, test } from "vitest";
import { z } from "../../../../index.js";
import ar from "../../../locales/ar.js";

test("Arabic locale - too_small errors", () => {
  z.config(ar());

  const stringResult = z.string().min(5).safeParse("abc");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("أصغر من اللازم: يفترض لـ string أن يكون >= 5 حرف");
  }

  const numberResult = z.number().min(10).safeParse(5);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("أصغر من اللازم: يفترض لـ number أن يكون >= 10");
  }

  const arrayResult = z.array(z.string()).min(3).safeParse(["a", "b"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("أصغر من اللازم: يفترض لـ array أن يكون >= 3 عنصر");
  }

  const setResult = z
    .set(z.string())
    .min(2)
    .safeParse(new Set(["a"]));
  expect(setResult.success).toBe(false);
  if (!setResult.success) {
    expect(setResult.error.issues[0].message).toBe("أصغر من اللازم: يفترض لـ set أن يكون >= 2 عنصر");
  }
});

test("Arabic locale - too_big errors", () => {
  z.config(ar());

  const stringResult = z.string().max(3).safeParse("abcde");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe(" أكبر من اللازم: يفترض أن تكون string <= 3 حرف");
  }

  const numberResult = z.number().max(10).safeParse(15);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("أكبر من اللازم: يفترض أن تكون number <= 10");
  }

  const arrayResult = z.array(z.string()).max(2).safeParse(["a", "b", "c"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe(" أكبر من اللازم: يفترض أن تكون array <= 2 عنصر");
  }
});

test("Arabic locale - invalid_type errors", () => {
  z.config(ar());

  const stringResult = z.string().safeParse(123);
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("مدخلات غير مقبولة: يفترض إدخال string، ولكن تم إدخال number");
  }

  const numberResult = z.number().safeParse("abc");
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("مدخلات غير مقبولة: يفترض إدخال number، ولكن تم إدخال string");
  }

  const booleanResult = z.boolean().safeParse(null);
  expect(booleanResult.success).toBe(false);
  if (!booleanResult.success) {
    expect(booleanResult.error.issues[0].message).toBe("مدخلات غير مقبولة: يفترض إدخال boolean، ولكن تم إدخال null");
  }
});

test("Arabic locale - other error cases", () => {
  z.config(ar());

  const enumResult = z.enum(["a", "b"]).safeParse("c");
  expect(enumResult.success).toBe(false);
  if (!enumResult.success) {
    expect(enumResult.error.issues[0].message).toBe('اختيار غير مقبول: يتوقع انتقاء أحد هذه الخيارات: "a"|"b"');
  }

  const multipleResult = z.number().multipleOf(3).safeParse(10);
  expect(multipleResult.success).toBe(false);
  if (!multipleResult.success) {
    expect(multipleResult.error.issues[0].message).toBe("رقم غير مقبول: يجب أن يكون من مضاعفات 3");
  }

  const strictResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "extra" });
  expect(strictResult.success).toBe(false);
  if (!strictResult.success) {
    expect(strictResult.error.issues[0].message).toBe('معرف غريب: "b"');
  }

  const strictMultiResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "x", c: "y" });
  expect(strictMultiResult.success).toBe(false);
  if (!strictMultiResult.success) {
    expect(strictMultiResult.error.issues[0].message).toBe('معرفات غريبة: "b"، "c"');
  }

  const unionResult = z.union([z.string(), z.number()]).safeParse(true);
  expect(unionResult.success).toBe(false);
  if (!unionResult.success) {
    expect(unionResult.error.issues[0].message).toBe("مدخل غير مقبول");
  }

  const regexResult = z
    .string()
    .regex(/^[a-z]+$/)
    .safeParse("ABC123");
  expect(regexResult.success).toBe(false);
  if (!regexResult.success) {
    expect(regexResult.error.issues[0].message).toBe("نَص غير مقبول: يجب أن يطابق النمط /^[a-z]+$/");
  }

  const endsWithResult = z.string().endsWith("world").safeParse("hello");
  expect(endsWithResult.success).toBe(false);
  if (!endsWithResult.success) {
    expect(endsWithResult.error.issues[0].message).toBe('نَص غير مقبول: يجب أن ينتهي بـ "world"');
  }
});
