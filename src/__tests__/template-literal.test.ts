// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

const empty = z.templateLiteral();
const hello = z.templateLiteral().addLiteral("hello");
const world = z.templateLiteral().addInterpolatedPosition(z.literal("world"));
const one = z.templateLiteral().addLiteral(1);
const two = z.templateLiteral().addInterpolatedPosition(z.literal(2));
const truee = z.templateLiteral().addLiteral(true);
const anotherTrue = z
  .templateLiteral()
  .addInterpolatedPosition(z.literal(true));
const falsee = z.templateLiteral().addLiteral(false);
const anotherFalse = z
  .templateLiteral()
  .addInterpolatedPosition(z.literal(false));
const nulll = z.templateLiteral().addLiteral(null);
const anotherNull = z.templateLiteral().addInterpolatedPosition(z.null());
const undefinedd = z.templateLiteral().addLiteral(undefined);
const anotherUndefined = z
  .templateLiteral()
  .addInterpolatedPosition(z.undefined());
const anyString = z.templateLiteral().addInterpolatedPosition(z.string());
const anyNumber = z.templateLiteral().addInterpolatedPosition(z.number());
const anyFiniteNumber = z
  .templateLiteral()
  .addInterpolatedPosition(z.number().finite());
const anyInt = z.templateLiteral().addInterpolatedPosition(z.number().int());
const anyNegativeNumber = z
  .templateLiteral()
  .addInterpolatedPosition(z.number().negative());
const anyPositiveNumber = z
  .templateLiteral()
  .addInterpolatedPosition(z.number().positive());
const bool = z.templateLiteral().addInterpolatedPosition(z.boolean());
const bigone = z
  .templateLiteral()
  .addInterpolatedPosition(z.literal(BigInt(1)));
const anyBigint = z.templateLiteral().addInterpolatedPosition(z.bigint());
const nullableYo = z
  .templateLiteral()
  .addInterpolatedPosition(z.nullable(z.literal("yo")));
const nullableString = z
  .templateLiteral()
  .addInterpolatedPosition(z.nullable(z.string()));
const optionalYeah = z
  .templateLiteral()
  .addInterpolatedPosition(z.literal("yeah").optional());
const optionalString = z
  .templateLiteral()
  .addInterpolatedPosition(z.string().optional());
const nullishBruh = z
  .templateLiteral()
  .addInterpolatedPosition(z.literal("bruh").nullish());
const nullishString = z
  .templateLiteral()
  .addInterpolatedPosition(z.string().nullish());

const url = z
  .templateLiteral()
  .addLiteral("https://")
  .addInterpolatedPosition(z.string().min(1))
  .addLiteral(".")
  .addInterpolatedPosition(z.enum(["com", "net"]));

const connectionString = z
  .templateLiteral()
  .addLiteral("mongodb://")
  .addInterpolatedPosition(
    z
      .templateLiteral()
      .addInterpolatedPosition(z.string().min(1).describe("username"))
      .addLiteral(":")
      .addInterpolatedPosition(z.string().min(1).describe("password"))
      .addLiteral("@")
      .optional()
  )
  .addInterpolatedPosition(z.string().min(1).describe("host"))
  .addLiteral(":")
  .addInterpolatedPosition(
    z.number().finite().int().positive().describe("port")
  )
  .addInterpolatedPosition(
    z
      .templateLiteral()
      .addLiteral("/")
      .addInterpolatedPosition(
        z.string().min(1).optional().describe("defaultauthdb")
      )
      .addInterpolatedPosition(
        z
          .templateLiteral()
          .addLiteral("?")
          .addInterpolatedPosition(z.string().regex(/^\w+=\w+(&\w+=\w+)*$/))
          .optional()
          .describe("options")
      )
      .optional()
  );

test("template literal type inference", () => {
  util.assertEqual<z.infer<typeof empty>, ``>(true);
  util.assertEqual<z.infer<typeof hello>, `hello`>(true);
  util.assertEqual<z.infer<typeof world>, `world`>(true);
  util.assertEqual<z.infer<typeof one>, `1`>(true);
  util.assertEqual<z.infer<typeof two>, `2`>(true);
  util.assertEqual<z.infer<typeof truee>, `true`>(true);
  util.assertEqual<z.infer<typeof anotherTrue>, `true`>(true);
  util.assertEqual<z.infer<typeof falsee>, `false`>(true);
  util.assertEqual<z.infer<typeof anotherFalse>, `false`>(true);
  util.assertEqual<z.infer<typeof nulll>, `null`>(true);
  util.assertEqual<z.infer<typeof anotherNull>, `null`>(true);
  util.assertEqual<z.infer<typeof undefinedd>, `undefined`>(true);
  util.assertEqual<z.infer<typeof anotherUndefined>, `undefined`>(true);
  util.assertEqual<z.infer<typeof anyString>, string>(true);
  util.assertEqual<z.infer<typeof anyNumber>, `${number}`>(true);
  util.assertEqual<z.infer<typeof anyFiniteNumber>, `${number}`>(true);
  util.assertEqual<z.infer<typeof anyInt>, `${number}`>(true);
  util.assertEqual<z.infer<typeof anyNegativeNumber>, `${number}`>(true);
  util.assertEqual<z.infer<typeof anyPositiveNumber>, `${number}`>(true);
  util.assertEqual<z.infer<typeof bool>, `true` | `false`>(true);
  util.assertEqual<z.infer<typeof bigone>, `${bigint}`>(true);
  util.assertEqual<z.infer<typeof anyBigint>, `${bigint}`>(true);
  util.assertEqual<z.infer<typeof nullableYo>, `yo` | `null`>(true);
  util.assertEqual<z.infer<typeof nullableString>, string>(true);
  util.assertEqual<z.infer<typeof optionalYeah>, `yeah` | ``>(true);
  util.assertEqual<z.infer<typeof optionalString>, string>(true);
  util.assertEqual<z.infer<typeof nullishBruh>, `bruh` | `null` | ``>(true);
  util.assertEqual<z.infer<typeof nullishString>, string>(true);

  util.assertEqual<
    z.infer<typeof url>,
    `https://${string}.com` | `https://${string}.net`
  >(true);

  util.assertEqual<
    z.infer<typeof connectionString>,
    | `mongodb://${string}:${number}`
    | `mongodb://${string}:${number}/${string}`
    | `mongodb://${string}:${number}/${string}?${string}`
    | `mongodb://${string}:${string}@${string}:${number}`
    | `mongodb://${string}:${string}@${string}:${number}/${string}`
    | `mongodb://${string}:${string}@${string}:${number}/${string}?${string}`
  >(true);
});

test("template literal unsupported args", () => {
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.object({}))
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.array(z.object({})))
  ).toThrow();
  expect(() =>
    z.templateLiteral().addInterpolatedPosition(
      // @ts-expect-error
      z.union([z.object({}), z.string()])
    )
  ).toThrow();
  // @ts-expect-error
  expect(() => z.templateLiteral().addInterpolatedPosition(z.any())).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.never())
  ).toThrow();
  // @ts-expect-error
  expect(() => z.templateLiteral().addInterpolatedPosition(z.date())).toThrow();
  expect(() =>
    z
      .templateLiteral()
      // @ts-expect-error
      .addInterpolatedPosition(z.custom<object>((data) => true))
  ).toThrow();
  expect(() =>
    z.templateLiteral().addInterpolatedPosition(
      // @ts-expect-error
      z.discriminatedUnion("discriminator", [z.object({}), z.object({})])
    )
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.function())
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.instanceof(class MyClass {}))
  ).toThrow();
  expect(() =>
    z.templateLiteral().addInterpolatedPosition(
      // @ts-expect-error
      z.intersection(z.object({}), z.object({}))
    )
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.map(z.string(), z.string()))
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.nullable(z.object({})))
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.optional(z.object({})))
  ).toThrow();
  expect(() =>
    z.templateLiteral().addInterpolatedPosition(
      // @ts-expect-error
      z.preprocess(() => true, z.boolean())
    )
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.promise())
  ).toThrow();
  // @ts-expect-error
  expect(() => z.templateLiteral().addInterpolatedPosition(z.nan())).toThrow();
  expect(() =>
    z.templateLiteral().addInterpolatedPosition(
      // @ts-expect-error
      z.pipeline(z.string(), z.string())
    )
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.record(z.unknown()))
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.set(z.string()))
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.symbol())
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.tuple([z.string()]))
  ).toThrow();
  expect(() =>
    // @ts-expect-error
    z.templateLiteral().addInterpolatedPosition(z.unknown())
  ).toThrow();
});

test("template literal parsing", () => {
  expect(() => z.templateLiteral().parse(7)).toThrow();

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
  bool.parse("true");
  bool.parse("false");
  bigone.parse("1");
  anyBigint.parse("123456");
  anyBigint.parse("0");
  anyBigint.parse("-123456");

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
  expect(() => bool.parse("123")).toThrow();
  expect(() => bigone.parse("2")).toThrow();
  expect(() => bigone.parse("c1")).toThrow();
  expect(() => anyBigint.parse("1.23")).toThrow();
  expect(() => anyBigint.parse("-1.23")).toThrow();
  expect(() => anyBigint.parse("c123")).toThrow();

  url.parse("https://example.com");
  url.parse("https://speedtest.net");

  expect(() => url.parse("http://example.com")).toThrow();
  expect(() => url.parse("https://.com")).toThrow();
  expect(() => url.parse("https://examplecom")).toThrow();
  expect(() => url.parse("https://example.org")).toThrow();
  expect(() => url.parse("https://example.net.il")).toThrow();

  connectionString.parse("mongodb://host:1234");
  connectionString.parse("mongodb://host:1234/");
  connectionString.parse("mongodb://host:1234/defaultauthdb");
  connectionString.parse("mongodb://host:1234/defaultauthdb?authSource=admin");
  connectionString.parse(
    "mongodb://host:1234/defaultauthdb?authSource=admin&connectTimeoutMS=300000"
  );
  connectionString.parse("mongodb://host:1234/?authSource=admin");
  connectionString.parse(
    "mongodb://host:1234/?authSource=admin&connectTimeoutMS=300000"
  );
  connectionString.parse("mongodb://username:password@host:1234");
  connectionString.parse("mongodb://username:password@host:1234/");
  connectionString.parse("mongodb://username:password@host:1234/defaultauthdb");
  connectionString.parse(
    "mongodb://username:password@host:1234/defaultauthdb?authSource=admin"
  );
  connectionString.parse(
    "mongodb://username:password@host:1234/defaultauthdb?authSource=admin&connectTimeoutMS=300000"
  );
  connectionString.parse(
    "mongodb://username:password@host:1234/?authSource=admin"
  );
  connectionString.parse(
    "mongodb://username:password@host:1234/?authSource=admin&connectTimeoutMS=300000"
  );

  expect(() => connectionString.parse("mongod://host:1234")).toThrow();
  expect(() => connectionString.parse("mongodb://:1234")).toThrow();
  expect(() => connectionString.parse("mongodb://host1234")).toThrow();
  expect(() => connectionString.parse("mongodb://host:d234")).toThrow();
  expect(() => connectionString.parse("mongodb://host:12.34")).toThrow();
  expect(() => connectionString.parse("mongodb://host:-1234")).toThrow();
  expect(() => connectionString.parse("mongodb://host:-12.34")).toThrow();
  expect(() => connectionString.parse("mongodb://host:")).toThrow();
  expect(() => connectionString.parse("mongodb://:password@host:1234"));
  expect(() => connectionString.parse("mongodb://usernamepassword@host:1234"));
  expect(() => connectionString.parse("mongodb://username:@host:1234"));
  expect(() => connectionString.parse("mongodb://@host:1234"));
  expect(() =>
    connectionString.parse("mongodb://host:1234/defaultauthdb?authSourceadmin")
  );
  expect(() => connectionString.parse("mongodb://host:1234/?authSourceadmin"));
  expect(() =>
    connectionString.parse(
      "mongodb://host:1234/defaultauthdb?&authSource=admin"
    )
  );
  expect(() =>
    connectionString.parse("mongodb://host:1234/?&authSource=admin")
  );
});
