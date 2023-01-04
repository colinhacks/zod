// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers/util";
import * as z from "../index";

const url = z
  .templateLiteral()
  .addPart(z.literal("https://"))
  .addPart(z.string().min(1))
  .addPart(z.literal("."))
  .addPart(z.enum(["com", "net"]));

const connectionString = z
  .templateLiteral()
  .addPart(z.literal("mongodb://"))
  .addPart(
    z
      .templateLiteral()
      .addPart(z.string().min(1).describe("username"))
      .addPart(z.literal(":"))
      .addPart(z.string().min(1).describe("password"))
      .addPart(z.literal("@"))
      .optional()
  )
  .addPart(z.string().min(1).describe("host"))
  .addPart(z.literal(":"))
  .addPart(z.number().int().positive().describe("port"))
  .addPart(
    z
      .templateLiteral()
      .addPart(z.literal("/"))
      .addPart(z.string().min(1).optional().describe("defaultauthdb"))
      .addPart(
        z
          .templateLiteral()
          .addPart(z.literal("?"))
          .addPart(z.string().regex(/^\w+=\w+(&\w+=\w+)*$/))
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

  // TODO: url throw checks.

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
  expect(() => connectionString.parse("mongodb://host:")).toThrow();

  // TODO: more connectionString throw checks.
});
