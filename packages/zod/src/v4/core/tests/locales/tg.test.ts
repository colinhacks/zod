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

  // singular units after numerals in Tajik
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

  const cases: [z.ZodType, unknown, string][] = [
    [z.literal("a"), "b", 'Вуруди нодуруст: "a" интизор мерафт'],
    [z.boolean(), null, "Вуруди нодуруст: boolean интизор мерафт, null гирифта шуд"],
    [z.number(), Number.NaN, "Вуруди нодуруст: рақам интизор мерафт, NaN гирифта шуд"],
    [z.number().lt(10), 10, "Хеле калон: number бояд <10 бошад"],
    [z.number().gt(10), 10, "Хеле хурд: number бояд >10 бошад"],
    [z.string().max(1), "ab", "Хеле калон: string бояд <=1 аломат дошта бошад"],
    [z.set(z.string()).min(1), new Set(), "Хеле хурд: set бояд >=1 унсур дошта бошад"],
    [z.map(z.string(), z.number()).min(1), new Map(), "Хеле хурд: map бояд >=1 сабт дошта бошад"],
    [z.file().min(1), new File([], "empty"), "Хеле хурд: file бояд >=1 байт дошта бошад"],
    [z.string().endsWith("ab"), "xy", 'Сатри нодуруст: бояд бо "ab" анҷом ёбад'],
    [z.string().includes("ab"), "xy", 'Сатри нодуруст: бояд "ab"-ро дар бар гирад'],
    [z.stringFormat("custom", () => false), "xy", "custom-и нодуруст"],
    [z.union([z.string(), z.number()]), null, "Вуруди нодуруст"],
    [
      z.discriminatedUnion("kind", [z.object({ kind: z.literal("a") }), z.object({ kind: z.literal("b") })]),
      { kind: "c" },
      "Қимати нодурусти дискриминатор: 'a' | 'b' интизор мерафт",
    ],
    [z.record(z.string().min(2), z.number()), { a: 1 }, "Калиди нодуруст дар record"],
    [z.map(z.string(), z.number()), new Map([[{}, 1]]), "Калиди нодуруст дар map"],
    [z.map(z.object({}), z.number()), new Map([[{}, "a"]]), "Қимати нодуруст дар map"],
    [z.custom(() => false), "a", "Вуруди нодуруст"],
  ];
  for (const [schema, input, message] of cases) {
    expect(schema.safeParse(input).error!.issues[0].message).toBe(message);
  }

  expect(z.object({ name: z.string().min(1), age: z.number().min(0) }).parse({ name: "Ali", age: 30 })).toEqual({
    name: "Ali",
    age: 30,
  });
});
