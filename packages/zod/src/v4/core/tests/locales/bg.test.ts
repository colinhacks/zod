import { expect, test } from "vitest";
import { z } from "../../../../index.js";
import bg from "../../../locales/bg.js";

test("Bulgarian locale - too_small errors", () => {
  z.config(bg());

  const stringResult = z.string().min(5).safeParse("abc");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("Твърде малко: очаква се string да съдържа >=5 символа");
  }

  const numberResult = z.number().min(10).safeParse(5);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("Твърде малко: очаква се number да бъде >=10");
  }

  const arrayResult = z.array(z.string()).min(3).safeParse(["a", "b"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("Твърде малко: очаква се array да съдържа >=3 елемента");
  }

  const setResult = z
    .set(z.string())
    .min(2)
    .safeParse(new Set(["a"]));
  expect(setResult.success).toBe(false);
  if (!setResult.success) {
    expect(setResult.error.issues[0].message).toBe("Твърде малко: очаква се set да съдържа >=2 елемента");
  }
});

test("Bulgarian locale - too_big errors", () => {
  z.config(bg());

  const stringResult = z.string().max(3).safeParse("abcde");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("Твърде голямо: очаква се string да съдържа <=3 символа");
  }

  const numberResult = z.number().max(10).safeParse(15);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("Твърде голямо: очаква се number да бъде <=10");
  }

  const arrayResult = z.array(z.string()).max(2).safeParse(["a", "b", "c"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("Твърде голямо: очаква се array да съдържа <=2 елемента");
  }
});

test("Bulgarian locale - invalid_type errors", () => {
  z.config(bg());

  const stringResult = z.string().safeParse(123);
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("Невалиден вход: очакван string, получен число");
  }

  const numberResult = z.number().safeParse("abc");
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("Невалиден вход: очакван число, получен string");
  }

  const booleanResult = z.boolean().safeParse(null);
  expect(booleanResult.success).toBe(false);
  if (!booleanResult.success) {
    expect(booleanResult.error.issues[0].message).toBe("Невалиден вход: очакван boolean, получен null");
  }

  const arrayResult = z.array(z.string()).safeParse({});
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("Невалиден вход: очакван масив, получен object");
  }
});

test("Bulgarian locale - other error cases", () => {
  z.config(bg());

  const enumResult = z.enum(["a", "b"]).safeParse("c");
  expect(enumResult.success).toBe(false);
  if (!enumResult.success) {
    expect(enumResult.error.issues[0].message).toBe('Невалидна опция: очаквано едно от "a"|"b"');
  }

  const multipleResult = z.number().multipleOf(3).safeParse(10);
  expect(multipleResult.success).toBe(false);
  if (!multipleResult.success) {
    expect(multipleResult.error.issues[0].message).toBe("Невалидно число: трябва да бъде кратно на 3");
  }

  const strictResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "extra" });
  expect(strictResult.success).toBe(false);
  if (!strictResult.success) {
    expect(strictResult.error.issues[0].message).toBe('Неразпознат ключ: "b"');
  }

  const strictMultiResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "x", c: "y" });
  expect(strictMultiResult.success).toBe(false);
  if (!strictMultiResult.success) {
    expect(strictMultiResult.error.issues[0].message).toBe('Неразпознати ключове: "b", "c"');
  }

  const unionResult = z.union([z.string(), z.number()]).safeParse(true);
  expect(unionResult.success).toBe(false);
  if (!unionResult.success) {
    expect(unionResult.error.issues[0].message).toBe("Невалиден вход");
  }

  const regexResult = z
    .string()
    .regex(/^[a-z]+$/)
    .safeParse("ABC123");
  expect(regexResult.success).toBe(false);
  if (!regexResult.success) {
    expect(regexResult.error.issues[0].message).toBe("Невалиден низ: трябва да съвпада с /^[a-z]+$/");
  }

  const startsWithResult = z.string().startsWith("hello").safeParse("world");
  expect(startsWithResult.success).toBe(false);
  if (!startsWithResult.success) {
    expect(startsWithResult.error.issues[0].message).toBe('Невалиден низ: трябва да започва с "hello"');
  }

  const endsWithResult = z.string().endsWith("world").safeParse("hello");
  expect(endsWithResult.success).toBe(false);
  if (!endsWithResult.success) {
    expect(endsWithResult.error.issues[0].message).toBe('Невалиден низ: трябва да завършва с "world"');
  }
});
