import * as z from "zod";
import { stringRegex } from "./packages/zod-core/src/regexes.js";

const empty = z.templateLiteral([]);
const hello = z.templateLiteral(["hello"]);
const world = z.templateLiteral(["", z.literal("world")]);
const one = z.templateLiteral([1]);
const two = z.templateLiteral(["", z.literal(2)]);
const truee = z.templateLiteral([true]);
const anotherTrue = z.templateLiteral(["", z.literal(true)]);

anotherTrue.parse("true");
const falsee = z.templateLiteral([false]);
const anotherFalse = z.templateLiteral(["", z.literal(false)]);
const nulll = z.templateLiteral([null]);
const anotherNull = z.templateLiteral(["", z.null()]);
const undefinedd = z.templateLiteral([undefined]);
const anotherUndefined = z.templateLiteral(["", z.undefined()]);
const anyString = z.templateLiteral(["", z.string()]);
const lazyString = z.templateLiteral(["", z.lazy(() => z.string())]);
const anyNumber = z.templateLiteral(["", z.number()]);
// const anyFiniteNumber = z.templateLiteral(["", z.number().finite()]);
const anyInt = z.templateLiteral(["", z.number().int()]);
// const anyNegativeNumber = z.templateLiteral(["", z.number().negative()]);
// const anyPositiveNumber = z.templateLiteral(["", z.number().positive()]);
// const zeroButInADumbWay = z.templateLiteral(["", z.number().nonnegative().nonpositive()]);
// const finiteButInADumbWay = z.templateLiteral(["", z.number().min(5).max(10)]);
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
// if (Math.random()) process.exit(0);

const ip = z.templateLiteral(["", z.string().ip()]);
const ipv4 = z.templateLiteral(["", z.string().ip({ version: "v4" })]);
const ipv6 = z.templateLiteral(["", z.string().ip({ version: "v6" })]);
const ulid = z.templateLiteral(["", z.string().ulid()]);
const uuid = z.templateLiteral(["", z.string().uuid()]);
const stringAToZ = z.templateLiteral(["", z.string().regex(/^[a-z]+$/)]);

const stringStartsWith = z.templateLiteral(["", z.string().startsWith("hello")]);
// if (Math.random()) {
//   console.log(z.string().startsWith("hello")._pattern)
//   process.exit();
// }
const stringEndsWith = z.templateLiteral(["", z.string().endsWith("world")]);
const stringMax5 = z.templateLiteral(["", z.string().max(5)]);

const stringMin5 = z.templateLiteral(["", z.string().min(5)]);

const stringLen5 = z.templateLiteral(["", z.string().length(5)]);

const stringMin5Max10 = z.templateLiteral(["", z.string().min(5).max(10)]);

const stringStartsWithMax5 = z.templateLiteral(["", z.string().startsWith("hello").max(5)]);

const brandedString = z.templateLiteral(["", z.string().$brand("myBrand")]);
// const anything = z.templateLiteral(["", z.any()]);

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

lazyString.parse("blahblahblah");

lazyString.parse("");

anyNumber.parse("123");

anyNumber.parse("1.23");

anyNumber.parse("0");

anyNumber.parse("-1.23");

anyNumber.parse("-123");
// console.log("// anyNumber")
// anyNumber.parse("Infinity");
// console.log("// anyNumber")
// anyNumber.parse("-Infinity");

anyInt.parse("123");
// console.log("anyInt")
// anyInt.parse("-123");
// console.log("// anyFiniteNumber")
// anyFiniteNumber.parse("123");
// console.log("// anyFiniteNumber")
// anyFiniteNumber.parse("1.23");
// console.log("// anyFiniteNumber")
// anyFiniteNumber.parse("0");
// console.log("// anyFiniteNumber")
// anyFiniteNumber.parse("-1.23");
// console.log("// anyFiniteNumber")
// anyFiniteNumber.parse("-123");
// console.log("// anyNegativeNumber")
// anyNegativeNumber.parse("-123");
// console.log("// anyNegativeNumber")
// anyNegativeNumber.parse("-1.23");
// console.log("// anyNegativeNumber")
// anyNegativeNumber.parse("-Infinity");
// console.log("// anyPositiveNumber")
// anyPositiveNumber.parse("123");
// console.log("// anyPositiveNumber")
// anyPositiveNumber.parse("1.23");
// console.log("// anyPositiveNumber")
// anyPositiveNumber.parse("Infinity");
// console.log("// zeroButInADumbWay")
// zeroButInADumbWay.parse("0");
// console.log("// zeroButInADumbWay")
// zeroButInADumbWay.parse("00000");
// console.log("// finiteButInADumbWay")
// finiteButInADumbWay.parse("5");
// console.log("// finiteButInADumbWay")
// finiteButInADumbWay.parse("10");
// console.log("// finiteButInADumbWay")
// finiteButInADumbWay.parse("6.66");

bool.parse("true");

bool.parse("false");

bigone.parse("1");

anyBigint.parse("123456");

anyBigint.parse("0");
// console.log("anyBigint")
// anyBigint.parse("-123456");

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
// console.log("optionalNumber")
// optionalNumber.parse("Infinity");
// console.log("optionalNumber")
// optionalNumber.parse("-Infinity");

nullishBruh.parse("bruh");

nullishBruh.parse("null");

nullishBruh.parse("");

cuid.parse("cjld2cyuq0000t3rmniod1foy");

cuidZZZ.parse("cjld2cyuq0000t3rmniod1foyZZZ");

cuid2.parse("tz4a98xxat96iws9zmbrgj3a");

datetime.parse(new Date().toISOString());

email.parse("info@example.com", { reportInput: true });

ip.parse("213.174.246.205");

ip.parse("c359:f57c:21e5:39eb:1187:e501:f936:b452");

ipv4.parse("213.174.246.205");

ipv6.parse("c359:f57c:21e5:39eb:1187:e501:f936:b452");

ulid.parse("01GW3D2QZJBYB6P1Z1AE997VPW");

uuid.parse("808989fd-3a6e-4af2-b607-737323a176f6");

stringAToZ.parse("asudgaskhdgashd");

stringStartsWith.parse("hello world");

stringEndsWith.parse("hello world");
// console.log("// stringMax5")
stringMax5.parse("hello");
// console.log("// stringMin5")
stringMin5.parse("hello");
// console.log("// stringLen5")
stringLen5.parse("hello");
// console.log("// stringMin5Max10")
stringMin5Max10.parse("hello worl");
// console.log("// stringStartsWithMax5")
stringStartsWithMax5.parse("hello");

brandedString.parse("branded string");
