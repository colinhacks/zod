import { expect, test } from "vitest";
import { z } from "../../../../index.js";
import th from "../../../locales/th.js";

test("Thai locale - too_small errors", () => {
  z.config(th());

  const stringResult = z.string().min(5).safeParse("abc");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("น้อยกว่ากำหนด: string ควรมีอย่างน้อย 5 ตัวอักษร");
  }

  const numberResult = z.number().min(10).safeParse(5);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("น้อยกว่ากำหนด: number ควรมีอย่างน้อย 10");
  }

  const arrayResult = z.array(z.string()).min(3).safeParse(["a", "b"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("น้อยกว่ากำหนด: array ควรมีอย่างน้อย 3 รายการ");
  }

  const setResult = z
    .set(z.string())
    .min(2)
    .safeParse(new Set(["a"]));
  expect(setResult.success).toBe(false);
  if (!setResult.success) {
    expect(setResult.error.issues[0].message).toBe("น้อยกว่ากำหนด: set ควรมีอย่างน้อย 2 รายการ");
  }
});

test("Thai locale - too_big errors", () => {
  z.config(th());

  const stringResult = z.string().max(3).safeParse("abcde");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("เกินกำหนด: string ควรมีไม่เกิน 3 ตัวอักษร");
  }

  const numberResult = z.number().max(10).safeParse(15);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("เกินกำหนด: number ควรมีไม่เกิน 10");
  }

  const arrayResult = z.array(z.string()).max(2).safeParse(["a", "b", "c"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("เกินกำหนด: array ควรมีไม่เกิน 2 รายการ");
  }
});

test("Thai locale - invalid_type errors", () => {
  z.config(th());

  const stringResult = z.string().safeParse(123);
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("ประเภทข้อมูลไม่ถูกต้อง: ควรเป็น string แต่ได้รับ ตัวเลข");
  }

  const numberResult = z.number().safeParse("abc");
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("ประเภทข้อมูลไม่ถูกต้อง: ควรเป็น ตัวเลข แต่ได้รับ string");
  }

  const booleanResult = z.boolean().safeParse(null);
  expect(booleanResult.success).toBe(false);
  if (!booleanResult.success) {
    expect(booleanResult.error.issues[0].message).toBe("ประเภทข้อมูลไม่ถูกต้อง: ควรเป็น boolean แต่ได้รับ ไม่มีค่า (null)");
  }

  const arrayResult = z.array(z.string()).safeParse({});
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("ประเภทข้อมูลไม่ถูกต้อง: ควรเป็น อาร์เรย์ (Array) แต่ได้รับ object");
  }
});

test("Thai locale - other error cases", () => {
  z.config(th());

  const enumResult = z.enum(["a", "b"]).safeParse("c");
  expect(enumResult.success).toBe(false);
  if (!enumResult.success) {
    expect(enumResult.error.issues[0].message).toBe('ตัวเลือกไม่ถูกต้อง: ควรเป็นหนึ่งใน "a"|"b"');
  }

  const multipleResult = z.number().multipleOf(3).safeParse(10);
  expect(multipleResult.success).toBe(false);
  if (!multipleResult.success) {
    expect(multipleResult.error.issues[0].message).toBe("ตัวเลขไม่ถูกต้อง: ต้องเป็นจำนวนที่หารด้วย 3 ได้ลงตัว");
  }

  const strictResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "extra" });
  expect(strictResult.success).toBe(false);
  if (!strictResult.success) {
    expect(strictResult.error.issues[0].message).toBe('พบคีย์ที่ไม่รู้จัก: "b"');
  }

  const unionResult = z.union([z.string(), z.number()]).safeParse(true);
  expect(unionResult.success).toBe(false);
  if (!unionResult.success) {
    expect(unionResult.error.issues[0].message).toBe("ข้อมูลไม่ถูกต้อง: ไม่ตรงกับรูปแบบยูเนียนที่กำหนดไว้");
  }

  const regexResult = z
    .string()
    .regex(/^[a-z]+$/)
    .safeParse("ABC123");
  expect(regexResult.success).toBe(false);
  if (!regexResult.success) {
    expect(regexResult.error.issues[0].message).toBe("รูปแบบไม่ถูกต้อง: ต้องตรงกับรูปแบบที่กำหนด /^[a-z]+$/");
  }

  const startsWithResult = z.string().startsWith("hello").safeParse("world");
  expect(startsWithResult.success).toBe(false);
  if (!startsWithResult.success) {
    expect(startsWithResult.error.issues[0].message).toBe('รูปแบบไม่ถูกต้อง: ข้อความต้องขึ้นต้นด้วย "hello"');
  }

  const endsWithResult = z.string().endsWith("world").safeParse("hello");
  expect(endsWithResult.success).toBe(false);
  if (!endsWithResult.success) {
    expect(endsWithResult.error.issues[0].message).toBe('รูปแบบไม่ถูกต้อง: ข้อความต้องลงท้ายด้วย "world"');
  }
});
