import { expect, test } from "vitest";
import { z } from "../../../../index.js";
import ka from "../../../locales/ka.js";

test("Georgian locale - too_small errors", () => {
  z.config(ka());

  const stringResult = z.string().min(5).safeParse("abc");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("ზედმეტად პატარა: მოსალოდნელი string უნდა შეიცავდეს >=5 სიმბოლო");
  }

  const numberResult = z.number().min(10).safeParse(5);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("ზედმეტად პატარა: მოსალოდნელი number იყოს >=10");
  }

  const arrayResult = z.array(z.string()).min(3).safeParse(["a", "b"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("ზედმეტად პატარა: მოსალოდნელი array უნდა შეიცავდეს >=3 ელემენტი");
  }

  const setResult = z
    .set(z.string())
    .min(2)
    .safeParse(new Set(["a"]));
  expect(setResult.success).toBe(false);
  if (!setResult.success) {
    expect(setResult.error.issues[0].message).toBe("ზედმეტად პატარა: მოსალოდნელი set უნდა შეიცავდეს >=2 ელემენტი");
  }
});

test("Georgian locale - too_big errors", () => {
  z.config(ka());

  const stringResult = z.string().max(3).safeParse("abcde");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("ზედმეტად დიდი: მოსალოდნელი string უნდა შეიცავდეს <=3 სიმბოლო");
  }

  const numberResult = z.number().max(10).safeParse(15);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("ზედმეტად დიდი: მოსალოდნელი number იყოს <=10");
  }

  const arrayResult = z.array(z.string()).max(2).safeParse(["a", "b", "c"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("ზედმეტად დიდი: მოსალოდნელი array უნდა შეიცავდეს <=2 ელემენტი");
  }
});

test("Georgian locale - invalid_type errors", () => {
  z.config(ka());

  const stringResult = z.string().safeParse(123);
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("არასწორი შეყვანა: მოსალოდნელი ველი, მიღებული რიცხვი");
  }

  const numberResult = z.number().safeParse("abc");
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("არასწორი შეყვანა: მოსალოდნელი რიცხვი, მიღებული ველი");
  }

  const booleanResult = z.boolean().safeParse(null);
  expect(booleanResult.success).toBe(false);
  if (!booleanResult.success) {
    expect(booleanResult.error.issues[0].message).toBe("არასწორი შეყვანა: მოსალოდნელი ბულეანი, მიღებული null");
  }

  const arrayResult = z.array(z.string()).safeParse({});
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("არასწორი შეყვანა: მოსალოდნელი მასივი, მიღებული object");
  }
});

test("Georgian locale - other error cases", () => {
  z.config(ka());

  const enumResult = z.enum(["a", "b"]).safeParse("c");
  expect(enumResult.success).toBe(false);
  if (!enumResult.success) {
    expect(enumResult.error.issues[0].message).toBe('არასწორი ვარიანტი: მოსალოდნელია ერთ-ერთი "a"|"b"-დან');
  }

  const multipleResult = z.number().multipleOf(3).safeParse(10);
  expect(multipleResult.success).toBe(false);
  if (!multipleResult.success) {
    expect(multipleResult.error.issues[0].message).toBe("არასწორი რიცხვი: უნდა იყოს 3-ის ჯერადი");
  }

  const strictResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "extra" });
  expect(strictResult.success).toBe(false);
  if (!strictResult.success) {
    expect(strictResult.error.issues[0].message).toBe('უცნობი გასაღები: "b"');
  }

  const strictMultiResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "x", c: "y" });
  expect(strictMultiResult.success).toBe(false);
  if (!strictMultiResult.success) {
    expect(strictMultiResult.error.issues[0].message).toBe('უცნობი გასაღებები: "b", "c"');
  }

  const unionResult = z.union([z.string(), z.number()]).safeParse(true);
  expect(unionResult.success).toBe(false);
  if (!unionResult.success) {
    expect(unionResult.error.issues[0].message).toBe("არასწორი შეყვანა");
  }

  const regexResult = z
    .string()
    .regex(/^[a-z]+$/)
    .safeParse("ABC123");
  expect(regexResult.success).toBe(false);
  if (!regexResult.success) {
    expect(regexResult.error.issues[0].message).toBe("არასწორი ველი: უნდა შეესაბამებოდეს შაბლონს /^[a-z]+$/");
  }

  const startsWithResult = z.string().startsWith("hello").safeParse("world");
  expect(startsWithResult.success).toBe(false);
  if (!startsWithResult.success) {
    expect(startsWithResult.error.issues[0].message).toBe('არასწორი ველი: უნდა იწყებოდეს "hello"-ით');
  }

  const endsWithResult = z.string().endsWith("world").safeParse("hello");
  expect(endsWithResult.success).toBe(false);
  if (!endsWithResult.success) {
    expect(endsWithResult.error.issues[0].message).toBe('არასწორი ველი: უნდა მთავრდებოდეს "world"-ით');
  }
});
