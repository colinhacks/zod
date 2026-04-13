import { expect, test } from "vitest";
import { z } from "../../../../index.js";
import pl from "../../../locales/pl.js";

test("Polish locale - too_small errors", () => {
  z.config(pl());

  const stringResult = z.string().min(5).safeParse("abc");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("Za mała wartość: oczekiwano, że string będzie mieć >=5 znaków");
  }

  const numberResult = z.number().min(10).safeParse(5);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("Zbyt mał(y/a/e): oczekiwano, że number będzie wynosić >=10");
  }

  const arrayResult = z.array(z.string()).min(3).safeParse(["a", "b"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("Za mała wartość: oczekiwano, że array będzie mieć >=3 elementów");
  }

  const setResult = z
    .set(z.string())
    .min(2)
    .safeParse(new Set(["a"]));
  expect(setResult.success).toBe(false);
  if (!setResult.success) {
    expect(setResult.error.issues[0].message).toBe("Za mała wartość: oczekiwano, że set będzie mieć >=2 elementów");
  }
});

test("Polish locale - too_big errors", () => {
  z.config(pl());

  const stringResult = z.string().max(3).safeParse("abcde");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("Za duża wartość: oczekiwano, że string będzie mieć <=3 znaków");
  }

  const numberResult = z.number().max(10).safeParse(15);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("Zbyt duż(y/a/e): oczekiwano, że number będzie wynosić <=10");
  }

  const arrayResult = z.array(z.string()).max(2).safeParse(["a", "b", "c"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("Za duża wartość: oczekiwano, że array będzie mieć <=2 elementów");
  }
});

test("Polish locale - invalid_type errors", () => {
  z.config(pl());

  const stringResult = z.string().safeParse(123);
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe(
      "Nieprawidłowe dane wejściowe: oczekiwano string, otrzymano liczba"
    );
  }

  const numberResult = z.number().safeParse("abc");
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe(
      "Nieprawidłowe dane wejściowe: oczekiwano liczba, otrzymano string"
    );
  }

  const booleanResult = z.boolean().safeParse(null);
  expect(booleanResult.success).toBe(false);
  if (!booleanResult.success) {
    expect(booleanResult.error.issues[0].message).toBe(
      "Nieprawidłowe dane wejściowe: oczekiwano boolean, otrzymano null"
    );
  }

  const arrayResult = z.array(z.string()).safeParse({});
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe(
      "Nieprawidłowe dane wejściowe: oczekiwano tablica, otrzymano object"
    );
  }
});

test("Polish locale - other error cases", () => {
  z.config(pl());

  const enumResult = z.enum(["a", "b"]).safeParse("c");
  expect(enumResult.success).toBe(false);
  if (!enumResult.success) {
    expect(enumResult.error.issues[0].message).toBe('Nieprawidłowa opcja: oczekiwano jednej z wartości "a"|"b"');
  }

  const multipleResult = z.number().multipleOf(3).safeParse(10);
  expect(multipleResult.success).toBe(false);
  if (!multipleResult.success) {
    expect(multipleResult.error.issues[0].message).toBe("Nieprawidłowa liczba: musi być wielokrotnością 3");
  }

  const strictResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "extra" });
  expect(strictResult.success).toBe(false);
  if (!strictResult.success) {
    expect(strictResult.error.issues[0].message).toBe('Nierozpoznane klucze: "b"');
  }

  const unionResult = z.union([z.string(), z.number()]).safeParse(true);
  expect(unionResult.success).toBe(false);
  if (!unionResult.success) {
    expect(unionResult.error.issues[0].message).toBe("Nieprawidłowe dane wejściowe");
  }

  const regexResult = z
    .string()
    .regex(/^[a-z]+$/)
    .safeParse("ABC123");
  expect(regexResult.success).toBe(false);
  if (!regexResult.success) {
    expect(regexResult.error.issues[0].message).toBe("Nieprawidłowy ciąg znaków: musi odpowiadać wzorcowi /^[a-z]+$/");
  }

  const startsWithResult = z.string().startsWith("hello").safeParse("world");
  expect(startsWithResult.success).toBe(false);
  if (!startsWithResult.success) {
    expect(startsWithResult.error.issues[0].message).toBe('Nieprawidłowy ciąg znaków: musi zaczynać się od "hello"');
  }

  const endsWithResult = z.string().endsWith("world").safeParse("hello");
  expect(endsWithResult.success).toBe(false);
  if (!endsWithResult.success) {
    expect(endsWithResult.error.issues[0].message).toBe('Nieprawidłowy ciąg znaków: musi kończyć się na "world"');
  }
});
