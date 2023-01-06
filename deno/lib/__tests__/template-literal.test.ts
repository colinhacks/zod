// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

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
  .addInterpolatedPosition(z.number().int().positive().describe("port"))
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
