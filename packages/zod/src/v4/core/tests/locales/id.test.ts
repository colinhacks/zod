import { expect, test } from "vitest";
import { z } from "../../../../index.js";
import id from "../../../locales/id.js";

test("Indonesian locale - too_small errors", () => {
  z.config(id());

  const stringResult = z.string().min(5).safeParse("abc");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("Terlalu kecil: diharapkan string memiliki >=5 karakter");
  }

  const numberResult = z.number().min(10).safeParse(5);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("Terlalu kecil: diharapkan number menjadi >=10");
  }

  const arrayResult = z.array(z.string()).min(3).safeParse(["a", "b"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("Terlalu kecil: diharapkan array memiliki >=3 item");
  }

  const setResult = z
    .set(z.string())
    .min(2)
    .safeParse(new Set(["a"]));
  expect(setResult.success).toBe(false);
  if (!setResult.success) {
    expect(setResult.error.issues[0].message).toBe("Terlalu kecil: diharapkan set memiliki >=2 item");
  }
});

test("Indonesian locale - too_big errors", () => {
  z.config(id());

  const stringResult = z.string().max(3).safeParse("abcde");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("Terlalu besar: diharapkan string memiliki <=3 karakter");
  }

  const numberResult = z.number().max(10).safeParse(15);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("Terlalu besar: diharapkan number menjadi <=10");
  }

  const arrayResult = z.array(z.string()).max(2).safeParse(["a", "b", "c"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("Terlalu besar: diharapkan array memiliki <=2 item");
  }
});

test("Indonesian locale - invalid_type errors", () => {
  z.config(id());

  const stringResult = z.string().safeParse(123);
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("Input tidak valid: diharapkan string, diterima number");
  }

  const numberResult = z.number().safeParse("abc");
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("Input tidak valid: diharapkan number, diterima string");
  }

  const booleanResult = z.boolean().safeParse(null);
  expect(booleanResult.success).toBe(false);
  if (!booleanResult.success) {
    expect(booleanResult.error.issues[0].message).toBe("Input tidak valid: diharapkan boolean, diterima null");
  }
});

test("Indonesian locale - other error cases", () => {
  z.config(id());

  const enumResult = z.enum(["a", "b"]).safeParse("c");
  expect(enumResult.success).toBe(false);
  if (!enumResult.success) {
    expect(enumResult.error.issues[0].message).toBe('Pilihan tidak valid: diharapkan salah satu dari "a"|"b"');
  }

  const multipleResult = z.number().multipleOf(3).safeParse(10);
  expect(multipleResult.success).toBe(false);
  if (!multipleResult.success) {
    expect(multipleResult.error.issues[0].message).toBe("Angka tidak valid: harus kelipatan dari 3");
  }

  const strictResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "extra" });
  expect(strictResult.success).toBe(false);
  if (!strictResult.success) {
    expect(strictResult.error.issues[0].message).toBe('Kunci tidak dikenali : "b"');
  }

  const unionResult = z.union([z.string(), z.number()]).safeParse(true);
  expect(unionResult.success).toBe(false);
  if (!unionResult.success) {
    expect(unionResult.error.issues[0].message).toBe("Input tidak valid");
  }

  const regexResult = z
    .string()
    .regex(/^[a-z]+$/)
    .safeParse("ABC123");
  expect(regexResult.success).toBe(false);
  if (!regexResult.success) {
    expect(regexResult.error.issues[0].message).toBe("String tidak valid: harus sesuai pola /^[a-z]+$/");
  }

  const startsWithResult = z.string().startsWith("hello").safeParse("world");
  expect(startsWithResult.success).toBe(false);
  if (!startsWithResult.success) {
    expect(startsWithResult.error.issues[0].message).toBe('String tidak valid: harus dimulai dengan "hello"');
  }

  const endsWithResult = z.string().endsWith("world").safeParse("hello");
  expect(endsWithResult.success).toBe(false);
  if (!endsWithResult.success) {
    expect(endsWithResult.error.issues[0].message).toBe('String tidak valid: harus berakhir dengan "world"');
  }
});
