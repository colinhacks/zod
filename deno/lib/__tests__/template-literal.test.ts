// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

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
  util.assertEqual<z.infer<typeof anyString>, `${string}`>(true);
  util.assertEqual<z.infer<typeof anyNumber>, `${number}`>(true);
  util.assertEqual<z.infer<typeof anyFiniteNumber>, `${number}`>(true);
  util.assertEqual<z.infer<typeof anyInt>, `${number}`>(true);
  util.assertEqual<z.infer<typeof anyNegativeNumber>, `${number}`>(true);
  util.assertEqual<z.infer<typeof anyPositiveNumber>, `${number}`>(true);
  util.assertEqual<z.infer<typeof bool>, `true` | `false`>(true);
  util.assertEqual<z.infer<typeof bigone>, `${bigint}`>(true);
  util.assertEqual<z.infer<typeof anyBigint>, `${bigint}`>(true);

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

test("template literal parsing", () => {
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

  expect(() => empty.parse("a")).toThrow();
  expect(() => hello.parse("world"));
  expect(() => world.parse("hello"));
  expect(() => one.parse("2"));
  expect(() => two.parse("1"));
  expect(() => truee.parse("false"));
  expect(() => anotherTrue.parse("false"));
  expect(() => falsee.parse("true"));
  expect(() => anotherFalse.parse("true"));
  expect(() => nulll.parse("123"));
  expect(() => anotherNull.parse("123"));
  expect(() => undefinedd.parse("123"));
  expect(() => anotherUndefined.parse("123"));
  expect(() => anyFiniteNumber.parse("Infinity"));
  expect(() => anyFiniteNumber.parse("-Infinity"));
  expect(() => anyInt.parse("1.23"));
  expect(() => anyInt.parse("-1.23"));
  expect(() => anyNegativeNumber.parse("0"));
  expect(() => anyNegativeNumber.parse("1"));
  expect(() => anyNegativeNumber.parse("Infinity"));
  expect(() => anyPositiveNumber.parse("0"));
  expect(() => anyPositiveNumber.parse("-1"));
  expect(() => anyPositiveNumber.parse("-Infinity"));

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
