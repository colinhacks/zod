import * as core from "@zod/core";
import * as util from "@zod/core/util";

import { expect, expectTypeOf, test } from "vitest";
import * as z from "zod";

const empty = z.templateLiteral([]);
const hello = z.templateLiteral(["hello"]);
const world = z.templateLiteral(["", z.literal("world")]);
const one = z.templateLiteral([1]);
const two = z.templateLiteral(["", z.literal(2)]);
const truee = z.templateLiteral([true]);
const anotherTrue = z.templateLiteral(["", z.literal(true)]);
const falsee = z.templateLiteral([false]);
const anotherFalse = z.templateLiteral(["", z.literal(false)]);
const nulll = z.templateLiteral([null]);
const anotherNull = z.templateLiteral(["", z.null()]);
const undefinedd = z.templateLiteral([undefined]);
const anotherUndefined = z.templateLiteral(["", z.undefined()]);
const anyString = z.templateLiteral(["", z.string()]);
const anyNumber = z.templateLiteral(["", z.number()]);
const anyFiniteNumber = z.templateLiteral(["", z.number().finite()]);
const anyInt = z.templateLiteral(["", z.number().int()]);
const anyNegativeNumber = z.templateLiteral(["", z.number().negative()]);
const anyPositiveNumber = z.templateLiteral(["", z.number().positive()]);
const zeroButInADumbWay = z.templateLiteral(["", z.number().nonnegative().nonpositive()]);
const finiteButInADumbWay = z.templateLiteral(["", z.number().min(5).max(10)]);
const bool = z.templateLiteral(["", z.boolean()]);
const bigone = z.templateLiteral(["", z.literal(BigInt(1))]);
const anyBigint = z.templateLiteral(["", z.bigint()]);
const nullableYo = z.templateLiteral(["", z.nullable(z.literal("yo"))]);
const nullableString = z.templateLiteral(["", z.nullable(z.string())]);
const optionalYeah = z.templateLiteral(["", z.literal("yeah").optional()]);
const optionalString = z.templateLiteral(["", z.string().optional()]);
const optionalNumber = z.templateLiteral(["", z.number().optional()]);
const nullishBruh = z.templateLiteral(["", z.literal("bruh").nullish()]);
const nullishString = z.templateLiteral(["", z.string().nullish()]);
const cuid = z.templateLiteral(["", z.string().cuid()]);
const cuidZZZ = z.templateLiteral(["", z.string().cuid(), "ZZZ"]);
const cuid2 = z.templateLiteral(["", z.string().cuid2()]);
const datetime = z.templateLiteral(["", z.string().datetime()]);
const email = z.templateLiteral(["", z.string().email()]);
const ip = z.templateLiteral(["", z.string().ip()]);
const ipv4 = z.templateLiteral(["", z.string().ip({ version: "v4" })]);
const ipv6 = z.templateLiteral(["", z.string().ip({ version: "v6" })]);
const ulid = z.templateLiteral(["", z.string().ulid()]);
const uuid = z.templateLiteral(["", z.string().uuid()]);
const stringAToZ = z.templateLiteral(["", z.string().regex(/^[a-z]+$/)]);
const stringStartsWith = z.templateLiteral(["", z.string().startsWith("hello")]);
const stringEndsWith = z.templateLiteral(["", z.string().endsWith("world")]);
const stringMax5 = z.templateLiteral(["", z.string().max(5)]);
const stringMin5 = z.templateLiteral(["", z.string().min(5)]);
const stringLen5 = z.templateLiteral(["", z.string().length(5)]);
const stringMin5Max10 = z.templateLiteral(["", z.string().min(5).max(10)]);
const stringStartsWithMax5 = z.templateLiteral(["", z.string().startsWith("hello").max(5)]);
const brandedString = z.templateLiteral(["", z.string().min(1).$brand("myBrand")]);
const anything = z.templateLiteral(["", z.any()]);

const url = z.templateLiteral(["https://", z.string().regex(/\w+/), ".", z.enum(["com", "net"])]);

const measurement = z.templateLiteral([
  "",
  z.number().finite(),
  z.enum(["px", "em", "rem", "vh", "vw", "vmin", "vmax"]).optional(),
]);

const connectionString = z.templateLiteral([
  "mongodb://",
  z.literal
    .template([
      "",
      z.string().regex(/\w+/).describe("username"),
      ":",
      z.string().regex(/\w+/).describe("password"),
      "@",
    ])
    .optional(),
  z.string().regex(/\w+/).describe("host"),
  ":",
  z.number().finite().int().positive().describe("port"),
  z.literal
    .template([
      "/",
      z.string().regex(/\w+/).optional().describe("defaultauthdb"),
      z.literal
        .template([
          "?",
          z
            .string()
            .regex(/^\w+=\w+(&\w+=\w+)*$/)
            .optional()
            .describe("options"),
        ])
        .optional(),
    ])
    .optional(),
]);

test("template literal type inference", () => {
  expectTypeOf<z.infer<typeof empty>>().toEqualTypeOf<``>();
  expectTypeOf<z.infer<typeof hello>>().toEqualTypeOf<`hello`>();
  expectTypeOf<z.infer<typeof world>>().toEqualTypeOf<`world`>();
  expectTypeOf<z.infer<typeof one>>().toEqualTypeOf<`1`>();
  expectTypeOf<z.infer<typeof two>>().toEqualTypeOf<`2`>();
  expectTypeOf<z.infer<typeof truee>>().toEqualTypeOf<`true`>();
  expectTypeOf<z.infer<typeof anotherTrue>>().toEqualTypeOf<`true`>();
  expectTypeOf<z.infer<typeof falsee>>().toEqualTypeOf<`false`>();
  expectTypeOf<z.infer<typeof anotherFalse>>().toEqualTypeOf<`false`>();
  expectTypeOf<z.infer<typeof nulll>>().toEqualTypeOf<`null`>();
  expectTypeOf<z.infer<typeof anotherNull>>().toEqualTypeOf<`null`>();
  expectTypeOf<z.infer<typeof undefinedd>>().toEqualTypeOf<`undefined`>();
  expectTypeOf<z.infer<typeof anotherUndefined>>().toEqualTypeOf<`undefined`>();
  expectTypeOf<z.infer<typeof anyString>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof anyNumber>>().toEqualTypeOf<`${number}`>();
  expectTypeOf<z.infer<typeof anyFiniteNumber>>().toEqualTypeOf<`${number}`>();
  expectTypeOf<z.infer<typeof anyInt>>().toEqualTypeOf<`${number}`>();
  expectTypeOf<z.infer<typeof anyNegativeNumber>>().toEqualTypeOf<`${number}`>();
  expectTypeOf<z.infer<typeof anyPositiveNumber>>().toEqualTypeOf<`${number}`>();
  expectTypeOf<z.infer<typeof zeroButInADumbWay>>().toEqualTypeOf<`${number}`>();
  expectTypeOf<z.infer<typeof finiteButInADumbWay>>().toEqualTypeOf<`${number}`>();
  expectTypeOf<z.infer<typeof bool>>().toEqualTypeOf<`true` | `false`>();
  expectTypeOf<z.infer<typeof bigone>>().toEqualTypeOf<`${bigint}`>();
  expectTypeOf<z.infer<typeof anyBigint>>().toEqualTypeOf<`${bigint}`>();
  expectTypeOf<z.infer<typeof nullableYo>>().toEqualTypeOf<`yo` | `null`>();
  expectTypeOf<z.infer<typeof nullableString>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof optionalYeah>>().toEqualTypeOf<`yeah` | ``>();
  expectTypeOf<z.infer<typeof optionalString>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof optionalNumber>>().toEqualTypeOf<`${number}` | ``>();
  expectTypeOf<z.infer<typeof nullishBruh>>().toEqualTypeOf<`bruh` | `null` | ``>();
  expectTypeOf<z.infer<typeof nullishString>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof cuid>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof cuidZZZ>>().toEqualTypeOf<`${string}ZZZ`>();
  expectTypeOf<z.infer<typeof cuid2>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof datetime>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof email>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof ip>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof ipv4>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof ipv6>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof ulid>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof uuid>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof stringAToZ>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof stringStartsWith>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof stringEndsWith>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof stringMax5>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof stringMin5>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof stringLen5>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof stringMin5Max10>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof stringStartsWithMax5>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof brandedString>>().toEqualTypeOf<string>();
  expectTypeOf<z.infer<typeof anything>>().toEqualTypeOf<`${any}`>();

  expectTypeOf<z.infer<typeof url>>().toEqualTypeOf<`https://${string}.com` | `https://${string}.net`>();

  expectTypeOf<
    z.infer<typeof measurement>
  >().toEqualTypeOf<
    | `${number}`
    | `${number}px`
    | `${number}em`
    | `${number}rem`
    | `${number}vh`
    | `${number}vw`
    | `${number}vmin`
    | `${number}vmax`
  >();

  expectTypeOf<
    z.infer<typeof connectionString>
  >().toEqualTypeOf<
    | `mongodb://${string}:${number}`
    | `mongodb://${string}:${number}/${string}`
    | `mongodb://${string}:${number}/${string}?${string}`
    | `mongodb://${string}:${string}@${string}:${number}`
    | `mongodb://${string}:${string}@${string}:${number}/${string}`
    | `mongodb://${string}:${string}@${string}:${number}/${string}?${string}`
  >();
});

test("template literal unsupported args", () => {
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.object({})])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.array(z.object({}))])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.union([z.object({}), z.string()])])
  ).toThrow();
  // @ts-expect-error
  expect(() => z.templateLiteral([z.date()])).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.custom<object>((data) => true)])
  ).toThrow();
  expect(() =>
    z.templateLiteral([
      // @ts-expect-error
      z.discriminatedUnion("discriminator", [z.object({}), z.object({})]),
    ])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.function()])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.instanceof(class MyClass {})])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.intersection(z.object({}), z.object({}))])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.map(z.string(), z.string())])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.nullable(z.object({}))])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.optional(z.object({}))])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.promise()])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.record(z.unknown())])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.set(z.string())])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.symbol()])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.tuple([z.string()])])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.unknown()])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.void()])
  ).toThrow();

  // These throw at runtime but not statically. This could be fixed, but
  // I think an informative runtime error is better than a confusing TS one
  expect(() =>
    // no @ts-expect-error
    z.templateLiteral([z.never()])
  ).toThrow();
  // no @ts-expect-error
  expect(() => z.templateLiteral([z.nan()])).toThrow();
  expect(() =>
    // no @ts-expect-error
    z.templateLiteral([z.pipe(z.string(), z.string())])
  ).toThrow();
  expect(() =>
    // no @ts-expect-error
    z.templateLiteral([z.lazy(() => z.string())])
  ).toThrow();
  expect(() =>
    // no @ts-expect-error
    z.templateLiteral([z.preprocess(() => true, z.boolean())])
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral([z.object({}).$brand("brand")])
  ).toThrow();
  expect(() => z.templateLiteral([z.number().multipleOf(2)])).toThrow();
  expect(() => z.templateLiteral([z.string().emoji()])).toThrow();
  expect(() => z.templateLiteral([z.string().url()])).toThrow();
  expect(() => z.templateLiteral([z.string().trim()])).toThrow();
  expect(() => z.templateLiteral([z.string().includes("train")])).toThrow();
  expect(() => z.templateLiteral([z.string().toLowerCase()])).toThrow();
  expect(() => z.templateLiteral([z.string().toUpperCase()])).toThrow();
});

test("template literal parsing - success - basic cases", () => {
  expect(() => z.templateLiteral([]).parse(7)).toThrow();

  empty.parse("");
  hello.parse("hello");
  world.parse("world");
  one.parse("1");
  two.parse("2");
  truee.parse("true");
  anotherTrue.parse("true");
  falsee.parse("false");
  anotherFalse.parse("false");
  nulll.parse("null");
  anotherNull.parse("null");
  undefinedd.parse("undefined");
  anotherUndefined.parse("undefined");
  anyString.parse("blahblahblah");
  anyString.parse("");
  anyNumber.parse("123");
  anyNumber.parse("1.23");
  anyNumber.parse("0");
  anyNumber.parse("-1.23");
  anyNumber.parse("-123");
  anyNumber.parse("Infinity");
  anyNumber.parse("-Infinity");
  anyFiniteNumber.parse("123");
  anyFiniteNumber.parse("1.23");
  anyFiniteNumber.parse("0");
  anyFiniteNumber.parse("-1.23");
  anyFiniteNumber.parse("-123");
  anyInt.parse("123");
  anyInt.parse("-123");
  anyNegativeNumber.parse("-123");
  anyNegativeNumber.parse("-1.23");
  anyNegativeNumber.parse("-Infinity");
  anyPositiveNumber.parse("123");
  anyPositiveNumber.parse("1.23");
  anyPositiveNumber.parse("Infinity");
  zeroButInADumbWay.parse("0");
  zeroButInADumbWay.parse("00000");
  finiteButInADumbWay.parse("5");
  finiteButInADumbWay.parse("10");
  finiteButInADumbWay.parse("6.66");
  bool.parse("true");
  bool.parse("false");
  bigone.parse("1");
  anyBigint.parse("123456");
  anyBigint.parse("0");
  anyBigint.parse("-123456");
  nullableYo.parse("yo");
  nullableYo.parse("null");
  nullableString.parse("abc");
  nullableString.parse("null");
  optionalYeah.parse("yeah");
  optionalYeah.parse("");
  optionalString.parse("abc");
  optionalString.parse("");
  optionalNumber.parse("123");
  optionalNumber.parse("1.23");
  optionalNumber.parse("0");
  optionalNumber.parse("-1.23");
  optionalNumber.parse("-123");
  optionalNumber.parse("Infinity");
  optionalNumber.parse("-Infinity");
  nullishBruh.parse("bruh");
  nullishBruh.parse("null");
  nullishBruh.parse("");
  cuid.parse("cjld2cyuq0000t3rmniod1foy");
  cuidZZZ.parse("cjld2cyuq0000t3rmniod1foyZZZ");
  cuid2.parse("tz4a98xxat96iws9zmbrgj3a");
  datetime.parse(new Date().toISOString());
  email.parse("info@example.com");
  ip.parse("213.174.246.205");
  ip.parse("c359:f57c:21e5:39eb:1187:e501:f936:b452");
  ipv4.parse("213.174.246.205");
  ipv6.parse("c359:f57c:21e5:39eb:1187:e501:f936:b452");
  ulid.parse("01GW3D2QZJBYB6P1Z1AE997VPW");
  uuid.parse("808989fd-3a6e-4af2-b607-737323a176f6");
  stringAToZ.parse("asudgaskhdgashd");
  stringStartsWith.parse("hello world");
  stringEndsWith.parse("hello world");
  stringMax5.parse("hello");
  stringMin5.parse("hello");
  stringLen5.parse("hello");
  stringMin5Max10.parse("hello worl");
  stringStartsWithMax5.parse("hello");
  brandedString.parse("branded string");
  anything.parse("");
  anything.parse("everything");
});

test("template literal parsing - failure - basic cases", () => {
  expect(() => empty.parse("a")).toThrow();
  expect(() => hello.parse("hello!")).toThrow();
  expect(() => hello.parse("!hello")).toThrow();
  expect(() => world.parse("world!")).toThrow();
  expect(() => world.parse("!world")).toThrow();
  expect(() => one.parse("2")).toThrow();
  expect(() => one.parse("12")).toThrow();
  expect(() => one.parse("21")).toThrow();
  expect(() => two.parse("1")).toThrow();
  expect(() => two.parse("21")).toThrow();
  expect(() => two.parse("12")).toThrow();
  expect(() => truee.parse("false")).toThrow();
  expect(() => truee.parse("1true")).toThrow();
  expect(() => truee.parse("true1")).toThrow();
  expect(() => anotherTrue.parse("false")).toThrow();
  expect(() => anotherTrue.parse("1true")).toThrow();
  expect(() => anotherTrue.parse("true1")).toThrow();
  expect(() => falsee.parse("true")).toThrow();
  expect(() => falsee.parse("1false")).toThrow();
  expect(() => falsee.parse("false1")).toThrow();
  expect(() => anotherFalse.parse("true")).toThrow();
  expect(() => anotherFalse.parse("1false")).toThrow();
  expect(() => anotherFalse.parse("false1")).toThrow();
  expect(() => nulll.parse("123")).toThrow();
  expect(() => nulll.parse("null1")).toThrow();
  expect(() => nulll.parse("1null")).toThrow();
  expect(() => anotherNull.parse("123")).toThrow();
  expect(() => anotherNull.parse("null1")).toThrow();
  expect(() => anotherNull.parse("1null")).toThrow();
  expect(() => undefinedd.parse("123")).toThrow();
  expect(() => undefinedd.parse("undefined1")).toThrow();
  expect(() => undefinedd.parse("1undefined")).toThrow();
  expect(() => anotherUndefined.parse("123")).toThrow();
  expect(() => anotherUndefined.parse("undefined1")).toThrow();
  expect(() => anotherUndefined.parse("1undefined")).toThrow();
  expect(() => anyNumber.parse("2a")).toThrow();
  expect(() => anyNumber.parse("a2")).toThrow();
  expect(() => anyNumber.parse("-2a")).toThrow();
  expect(() => anyNumber.parse("a-2")).toThrow();
  expect(() => anyNumber.parse("2.5a")).toThrow();
  expect(() => anyNumber.parse("a2.5")).toThrow();
  expect(() => anyNumber.parse("Infinitya")).toThrow();
  expect(() => anyNumber.parse("aInfinity")).toThrow();
  expect(() => anyNumber.parse("-Infinitya")).toThrow();
  expect(() => anyNumber.parse("a-Infinity")).toThrow();
  expect(() => anyNumber.parse("2e5")).toThrow();
  expect(() => anyNumber.parse("2e-5")).toThrow();
  expect(() => anyNumber.parse("2e+5")).toThrow();
  expect(() => anyNumber.parse("-2e5")).toThrow();
  expect(() => anyNumber.parse("-2e-5")).toThrow();
  expect(() => anyNumber.parse("-2e+5")).toThrow();
  expect(() => anyNumber.parse("2.1e5")).toThrow();
  expect(() => anyNumber.parse("2.1e-5")).toThrow();
  expect(() => anyNumber.parse("2.1e+5")).toThrow();
  expect(() => anyNumber.parse("-2.1e5")).toThrow();
  expect(() => anyNumber.parse("-2.1e-5")).toThrow();
  expect(() => anyNumber.parse("-2.1e+5")).toThrow();
  expect(() => anyFiniteNumber.parse("Infinity")).toThrow();
  expect(() => anyFiniteNumber.parse("-Infinity")).toThrow();
  expect(() => anyFiniteNumber.parse("123a")).toThrow();
  expect(() => anyFiniteNumber.parse("a123")).toThrow();
  expect(() => anyInt.parse("1.23")).toThrow();
  expect(() => anyInt.parse("-1.23")).toThrow();
  expect(() => anyInt.parse("d1")).toThrow();
  expect(() => anyInt.parse("1d")).toThrow();
  expect(() => anyNegativeNumber.parse("0")).toThrow();
  expect(() => anyNegativeNumber.parse("1")).toThrow();
  expect(() => anyNegativeNumber.parse("Infinity")).toThrow();
  expect(() => anyPositiveNumber.parse("0")).toThrow();
  expect(() => anyPositiveNumber.parse("-1")).toThrow();
  expect(() => anyPositiveNumber.parse("-Infinity")).toThrow();
  expect(() => zeroButInADumbWay.parse("1")).toThrow();
  expect(() => zeroButInADumbWay.parse("-1")).toThrow();
  expect(() => finiteButInADumbWay.parse("Infinity")).toThrow();
  expect(() => finiteButInADumbWay.parse("-Infinity")).toThrow();
  expect(() => finiteButInADumbWay.parse("-5")).toThrow();
  expect(() => finiteButInADumbWay.parse("10a")).toThrow();
  expect(() => finiteButInADumbWay.parse("a10")).toThrow();
  expect(() => bool.parse("123")).toThrow();
  expect(() => bigone.parse("2")).toThrow();
  expect(() => bigone.parse("c1")).toThrow();
  expect(() => anyBigint.parse("1.23")).toThrow();
  expect(() => anyBigint.parse("-1.23")).toThrow();
  expect(() => anyBigint.parse("c123")).toThrow();
  expect(() => nullableYo.parse("yo1")).toThrow();
  expect(() => nullableYo.parse("1yo")).toThrow();
  expect(() => nullableYo.parse("null1")).toThrow();
  expect(() => nullableYo.parse("1null")).toThrow();
  expect(() => optionalYeah.parse("yeah1")).toThrow();
  expect(() => optionalYeah.parse("1yeah")).toThrow();
  expect(() => optionalYeah.parse("undefined")).toThrow();
  expect(() => optionalNumber.parse("123a")).toThrow();
  expect(() => optionalNumber.parse("a123")).toThrow();
  expect(() => optionalNumber.parse("Infinitya")).toThrow();
  expect(() => optionalNumber.parse("aInfinity")).toThrow();
  expect(() => nullishBruh.parse("bruh1")).toThrow();
  expect(() => nullishBruh.parse("1bruh")).toThrow();
  expect(() => nullishBruh.parse("null1")).toThrow();
  expect(() => nullishBruh.parse("1null")).toThrow();
  expect(() => nullishBruh.parse("undefined")).toThrow();
  expect(() => cuid.parse("bjld2cyuq0000t3rmniod1foy")).toThrow();
  expect(() => cuid.parse("cjld2cyu")).toThrow();
  expect(() => cuid.parse("cjld2 cyu")).toThrow();
  expect(() => cuid.parse("cjld2cyuq0000t3rmniod1foy ")).toThrow();
  expect(() => cuid.parse("1cjld2cyuq0000t3rmniod1foy")).toThrow();
  expect(() => cuidZZZ.parse("cjld2cyuq0000t3rmniod1foy")).toThrow();
  expect(() => cuidZZZ.parse("cjld2cyuq0000t3rmniod1foyZZY")).toThrow();
  expect(() => cuidZZZ.parse("cjld2cyuq0000t3rmniod1foyZZZ1")).toThrow();
  expect(() => cuidZZZ.parse("1cjld2cyuq0000t3rmniod1foyZZZ")).toThrow();
  expect(() => cuid2.parse("A9z4a98xxat96iws9zmbrgj3a")).toThrow();
  expect(() => cuid2.parse("tz4a98xxat96iws9zmbrgj3!")).toThrow();
  expect(() => datetime.parse("2022-01-01 00:00:00")).toThrow();
  expect(() => email.parse("info@example.com@")).toThrow();
  expect(() => ip.parse("213.174.246:205")).toThrow();
  expect(() => ip.parse("c359.f57c:21e5:39eb:1187:e501:f936:b452")).toThrow();
  expect(() => ipv4.parse("1213.174.246.205")).toThrow();
  expect(() => ipv4.parse("c359:f57c:21e5:39eb:1187:e501:f936:b452")).toThrow();
  expect(() => ipv6.parse("c359:f57c:21e5:39eb:1187:e501:f936:b4521")).toThrow();
  expect(() => ipv6.parse("213.174.246.205")).toThrow();
  expect(() => ulid.parse("01GW3D2QZJBYB6P1Z1AE997VPW!")).toThrow();
  expect(() => uuid.parse("808989fd-3a6e-4af2-b607-737323a176f6Z")).toThrow();
  expect(() => uuid.parse("Z808989fd-3a6e-4af2-b607-737323a176f6")).toThrow();
  expect(() => stringAToZ.parse("asdasdasd1")).toThrow();
  expect(() => stringAToZ.parse("1asdasdasd")).toThrow();
  expect(() => stringStartsWith.parse("ahello")).toThrow();
  expect(() => stringEndsWith.parse("worlda")).toThrow();
  expect(() => stringMax5.parse("123456")).toThrow();
  expect(() => stringMin5.parse("1234")).toThrow();
  expect(() => stringLen5.parse("123456")).toThrow();
  expect(() => stringLen5.parse("1234")).toThrow();
  expect(() => stringMin5Max10.parse("1234")).toThrow();
  expect(() => stringMin5Max10.parse("12345678901")).toThrow();
  expect(() => stringStartsWithMax5.parse("hello1")).toThrow();
  expect(() => stringStartsWithMax5.parse("1hell")).toThrow();
  expect(() => brandedString.parse("")).toThrow();
});

test("template literal parsing - success - complex cases", () => {
  url.parse("https://example.com");
  url.parse("https://speedtest.net");

  // measurement.parse(1);
  // measurement.parse(1.1);
  // measurement.parse(0);
  // measurement.parse(-1.1);
  // measurement.parse(-1);
  measurement.parse("1");
  measurement.parse("1.1");
  measurement.parse("0");
  measurement.parse("-1");
  measurement.parse("-1.1");
  measurement.parse("1px");
  measurement.parse("1.1px");
  measurement.parse("0px");
  measurement.parse("-1px");
  measurement.parse("-1.1px");
  measurement.parse("1em");
  measurement.parse("1.1em");
  measurement.parse("0em");
  measurement.parse("-1em");
  measurement.parse("-1.1em");
  measurement.parse("1rem");
  measurement.parse("1.1rem");
  measurement.parse("0rem");
  measurement.parse("-1rem");
  measurement.parse("-1.1rem");
  measurement.parse("1vh");
  measurement.parse("1.1vh");
  measurement.parse("0vh");
  measurement.parse("-1vh");
  measurement.parse("-1.1vh");
  measurement.parse("1vw");
  measurement.parse("1.1vw");
  measurement.parse("0vw");
  measurement.parse("-1vw");
  measurement.parse("-1.1vw");
  measurement.parse("1vmin");
  measurement.parse("1.1vmin");
  measurement.parse("0vmin");
  measurement.parse("-1vmin");
  measurement.parse("-1.1vmin");
  measurement.parse("1vmax");
  measurement.parse("1.1vmax");
  measurement.parse("0vmax");
  measurement.parse("-1vmax");
  measurement.parse("-1.1vmax");

  connectionString.parse("mongodb://host:1234");
  connectionString.parse("mongodb://host:1234/");
  connectionString.parse("mongodb://host:1234/defaultauthdb");
  connectionString.parse("mongodb://host:1234/defaultauthdb?authSource=admin");
  connectionString.parse("mongodb://host:1234/defaultauthdb?authSource=admin&connectTimeoutMS=300000");
  connectionString.parse("mongodb://host:1234/?authSource=admin");
  connectionString.parse("mongodb://host:1234/?authSource=admin&connectTimeoutMS=300000");
  connectionString.parse("mongodb://username:password@host:1234");
  connectionString.parse("mongodb://username:password@host:1234/");
  connectionString.parse("mongodb://username:password@host:1234/defaultauthdb");
  connectionString.parse("mongodb://username:password@host:1234/defaultauthdb?authSource=admin");
  connectionString.parse(
    "mongodb://username:password@host:1234/defaultauthdb?authSource=admin&connectTimeoutMS=300000"
  );
  connectionString.parse("mongodb://username:password@host:1234/?authSource=admin");
  connectionString.parse("mongodb://username:password@host:1234/?authSource=admin&connectTimeoutMS=300000");
});

test("template literal parsing - failure - complex cases", () => {
  expect(() => url.parse("http://example.com")).toThrow();
  expect(() => url.parse("https://.com")).toThrow();
  expect(() => url.parse("https://examplecom")).toThrow();
  expect(() => url.parse("https://example.org")).toThrow();
  expect(() => url.parse("https://example.net.il")).toThrow();

  expect(() => measurement.parse("1.1.1")).toThrow();
  expect(() => measurement.parse("Infinity")).toThrow();
  expect(() => measurement.parse("-Infinity")).toThrow();
  expect(() => measurement.parse("NaN")).toThrow();
  expect(() => measurement.parse("1%")).toThrow();

  expect(() => connectionString.parse("mongod://host:1234")).toThrow();
  expect(() => connectionString.parse("mongodb://:1234")).toThrow();
  expect(() => connectionString.parse("mongodb://host1234")).toThrow();
  expect(() => connectionString.parse("mongodb://host:d234")).toThrow();
  expect(() => connectionString.parse("mongodb://host:12.34")).toThrow();
  expect(() => connectionString.parse("mongodb://host:-1234")).toThrow();
  expect(() => connectionString.parse("mongodb://host:-12.34")).toThrow();
  expect(() => connectionString.parse("mongodb://host:")).toThrow();
  expect(() => connectionString.parse("mongodb://:password@host:1234")).toThrow();
  expect(() => connectionString.parse("mongodb://usernamepassword@host:1234")).toThrow();
  expect(() => connectionString.parse("mongodb://username:@host:1234")).toThrow();
  expect(() => connectionString.parse("mongodb://@host:1234")).toThrow();
  expect(() => connectionString.parse("mongodb://host:1234/defaultauthdb?authSourceadmin")).toThrow();
  expect(() => connectionString.parse("mongodb://host:1234/?authSourceadmin")).toThrow();
  expect(() => connectionString.parse("mongodb://host:1234/defaultauthdb?&authSource=admin")).toThrow();
  expect(() => connectionString.parse("mongodb://host:1234/?&authSource=admin")).toThrow();
});
