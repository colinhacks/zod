// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import { util } from "../helpers/util.ts";
import * as z from "../index.ts";

const url = z
  .templateLiteral()
  .addPart(z.literal("https://"))
  .addPart(z.string())
  .addPart(z.literal("."))
  .addPart(z.enum(["com", "net"]));

const connectionString = z
  .templateLiteral()
  .addPart(z.literal("mongodb://"))
  .addPart(z.string().min(1))
  .addPart(z.literal(":"))
  .addPart(z.string().min(1))
  .addPart(z.literal("@"))
  .addPart(z.string().min(1))
  .addPart(z.literal(":"))
  .addPart(z.number().int().positive())
  .addPart(
    z
      .templateLiteral()
      .addPart(z.literal("/"))
      .addPart(z.string())
      .addPart(
        z
          .templateLiteral()
          .addPart(z.literal("?"))
          .addPart(z.string().min(1))
          .optional()
      )
      .optional()
  );

test("type inference", () => {
  util.assertEqual<
    z.infer<typeof url>,
    `https://${string}.com` | `https://${string}.net`
  >(true);

  util.assertEqual<
    z.infer<typeof connectionString>,
    | `mongodb://${string}:${string}@${string}:${number}`
    | `mongodb://${string}:${string}@${string}:${number}/${string}`
    | `mongodb://${string}:${string}@${string}:${number}/${string}?${string}`
  >(true);
});
