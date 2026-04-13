import { expect, test } from "vitest";
import { z } from "../../../../index.js";
import ta from "../../../locales/ta.js";

test("Tamil locale - too_small errors", () => {
  z.config(ta());

  const stringResult = z.string().min(5).safeParse("abc");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe(
      "மிகச் சிறியது: எதிர்பார்க்கப்பட்டது string >=5 எழுத்துக்கள் ஆக இருக்க வேண்டும்"
    );
  }

  const numberResult = z.number().min(10).safeParse(5);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("மிகச் சிறியது: எதிர்பார்க்கப்பட்டது number >=10 ஆக இருக்க வேண்டும்");
  }

  const arrayResult = z.array(z.string()).min(3).safeParse(["a", "b"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("மிகச் சிறியது: எதிர்பார்க்கப்பட்டது array >=3 உறுப்புகள் ஆக இருக்க வேண்டும்");
  }

  const setResult = z
    .set(z.string())
    .min(2)
    .safeParse(new Set(["a"]));
  expect(setResult.success).toBe(false);
  if (!setResult.success) {
    expect(setResult.error.issues[0].message).toBe("மிகச் சிறியது: எதிர்பார்க்கப்பட்டது set >=2 உறுப்புகள் ஆக இருக்க வேண்டும்");
  }
});

test("Tamil locale - too_big errors", () => {
  z.config(ta());

  const stringResult = z.string().max(3).safeParse("abcde");
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe(
      "மிக பெரியது: எதிர்பார்க்கப்பட்டது string <=3 எழுத்துக்கள் ஆக இருக்க வேண்டும்"
    );
  }

  const numberResult = z.number().max(10).safeParse(15);
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("மிக பெரியது: எதிர்பார்க்கப்பட்டது number <=10 ஆக இருக்க வேண்டும்");
  }

  const arrayResult = z.array(z.string()).max(2).safeParse(["a", "b", "c"]);
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("மிக பெரியது: எதிர்பார்க்கப்பட்டது array <=2 உறுப்புகள் ஆக இருக்க வேண்டும்");
  }
});

test("Tamil locale - invalid_type errors", () => {
  z.config(ta());

  const stringResult = z.string().safeParse(123);
  expect(stringResult.success).toBe(false);
  if (!stringResult.success) {
    expect(stringResult.error.issues[0].message).toBe("தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது string, பெறப்பட்டது எண்");
  }

  const numberResult = z.number().safeParse("abc");
  expect(numberResult.success).toBe(false);
  if (!numberResult.success) {
    expect(numberResult.error.issues[0].message).toBe("தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது எண், பெறப்பட்டது string");
  }

  const booleanResult = z.boolean().safeParse(null);
  expect(booleanResult.success).toBe(false);
  if (!booleanResult.success) {
    expect(booleanResult.error.issues[0].message).toBe("தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது boolean, பெறப்பட்டது வெறுமை");
  }

  const arrayResult = z.array(z.string()).safeParse({});
  expect(arrayResult.success).toBe(false);
  if (!arrayResult.success) {
    expect(arrayResult.error.issues[0].message).toBe("தவறான உள்ளீடு: எதிர்பார்க்கப்பட்டது அணி, பெறப்பட்டது object");
  }
});

test("Tamil locale - other error cases", () => {
  z.config(ta());

  const enumResult = z.enum(["a", "b"]).safeParse("c");
  expect(enumResult.success).toBe(false);
  if (!enumResult.success) {
    expect(enumResult.error.issues[0].message).toBe('தவறான விருப்பம்: எதிர்பார்க்கப்பட்டது "a"|"b" இல் ஒன்று');
  }

  const multipleResult = z.number().multipleOf(3).safeParse(10);
  expect(multipleResult.success).toBe(false);
  if (!multipleResult.success) {
    expect(multipleResult.error.issues[0].message).toBe("தவறான எண்: 3 இன் பலமாக இருக்க வேண்டும்");
  }

  const strictResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "extra" });
  expect(strictResult.success).toBe(false);
  if (!strictResult.success) {
    expect(strictResult.error.issues[0].message).toBe('அடையாளம் தெரியாத விசை: "b"');
  }

  const strictMultiResult = z.object({ a: z.string() }).strict().safeParse({ a: "test", b: "x", c: "y" });
  expect(strictMultiResult.success).toBe(false);
  if (!strictMultiResult.success) {
    expect(strictMultiResult.error.issues[0].message).toBe('அடையாளம் தெரியாத விசைகள்: "b", "c"');
  }

  const unionResult = z.union([z.string(), z.number()]).safeParse(true);
  expect(unionResult.success).toBe(false);
  if (!unionResult.success) {
    expect(unionResult.error.issues[0].message).toBe("தவறான உள்ளீடு");
  }

  const regexResult = z
    .string()
    .regex(/^[a-z]+$/)
    .safeParse("ABC123");
  expect(regexResult.success).toBe(false);
  if (!regexResult.success) {
    expect(regexResult.error.issues[0].message).toBe("தவறான சரம்: /^[a-z]+$/ முறைபாட்டுடன் பொருந்த வேண்டும்");
  }

  const startsWithResult = z.string().startsWith("hello").safeParse("world");
  expect(startsWithResult.success).toBe(false);
  if (!startsWithResult.success) {
    expect(startsWithResult.error.issues[0].message).toBe('தவறான சரம்: "hello" இல் தொடங்க வேண்டும்');
  }

  const endsWithResult = z.string().endsWith("world").safeParse("hello");
  expect(endsWithResult.success).toBe(false);
  if (!endsWithResult.success) {
    expect(endsWithResult.error.issues[0].message).toBe('தவறான சரம்: "world" இல் முடிவடைய வேண்டும்');
  }
});
