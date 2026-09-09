import { expect, test } from "vitest";
import * as z from "zod/v4";

test("locales - tg", () => {
  z.config(z.locales.tg());

  const invalidType = z.number().safeParse("a");
  expect(invalidType.error!.issues[0].code).toBe("invalid_type");
  expect(invalidType.error!.issues[0].message).toBe("Вуруди нодуруст: рақам интизор мерафт, сатр гирифта шуд");

  const invalidType2 = z.string().safeParse(1);
  expect(invalidType2.error!.issues[0].code).toBe("invalid_type");
  expect(invalidType2.error!.issues[0].message).toBe("Вуруди нодуруст: сатр интизор мерафт, рақам гирифта шуд");

  const invalidValue = z.enum(["a", "b"]).safeParse(1);
  expect(invalidValue.error!.issues[0].code).toBe("invalid_value");
  expect(invalidValue.error!.issues[0].message).toBe('Интихоби нодуруст: яке аз "a"|"b" интизор мерафт');

  const tooBig = z.number().max(10).safeParse(15);
  expect(tooBig.error!.issues[0].code).toBe("too_big");
  expect(tooBig.error!.issues[0].message).toBe("Хеле калон: number бояд <=10 бошад");

  const tooSmall = z.number().min(10).safeParse(5);
  expect(tooSmall.error!.issues[0].code).toBe("too_small");
  expect(tooSmall.error!.issues[0].message).toBe("Хеле хурд: number бояд >=10 бошад");

  // A noun after a numeral keeps its singular form in Tajik, so the unit is not inflected
  const tooShort = z.string().min(5).safeParse("hi");
  expect(tooShort.error!.issues[0].message).toBe("Хеле хурд: string бояд >=5 аломат дошта бошад");

  const tooFewItems = z.array(z.number()).min(2).safeParse([1]);
  expect(tooFewItems.error!.issues[0].message).toBe("Хеле хурд: array бояд >=2 унсур дошта бошад");

  const invalidEmail = z.string().email().safeParse("nope");
  expect(invalidEmail.error!.issues[0].code).toBe("invalid_format");
  expect(invalidEmail.error!.issues[0].message).toBe("суроғаи email-и нодуруст");

  const invalidStart = z.string().startsWith("ab").safeParse("xy");
  expect(invalidStart.error!.issues[0].message).toBe('Сатри нодуруст: бояд бо "ab" оғоз шавад');

  const invalidRegex = z.string().regex(/abcd/).safeParse("xy");
  expect(invalidRegex.error!.issues[0].message).toContain("мувофиқат кунад");

  const notMultipleOf = z.number().multipleOf(5).safeParse(7);
  expect(notMultipleOf.error!.issues[0].message).toBe("Рақами нодуруст: бояд ба 5 бе бақия тақсим шавад");

  const oneUnknownKey = z.strictObject({ a: z.string() }).safeParse({ a: "x", b: 1 });
  expect(oneUnknownKey.error!.issues[0].message).toBe('Калиди номаълум: "b"');

  const twoUnknownKeys = z.strictObject({ a: z.string() }).safeParse({ a: "x", b: 1, c: 2 });
  expect(twoUnknownKeys.error!.issues[0].message).toBe('Калидҳои номаълум: "b", "c"');
});
