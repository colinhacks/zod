import { randomBytes } from "node:crypto";
import { z } from "zod/v4";

const schemas = [z.number().int(), z.int(), z.int().positive(), z.int().nonnegative(), z.int().gt(0), z.int().gte(0)];

for (const schema of schemas) {
  console.log(`Accepts ${Number.MAX_SAFE_INTEGER}`, schema.safeParse(Number.MAX_SAFE_INTEGER).success ? "YES" : "NO");
  console.log("JSON Schema", z.toJSONSchema(schema));
}

// /^(?:[0-9a-zA-Z+/][0-9a-zA-Z+/][0-9a-zA-Z+/][0-9a-zA-Z+/])*(?:[0-9a-zA-Z+/][0-9a-zA-Z+/]==|[0-9a-zA-Z+/][0-9a-zA-Z+/][0-9a-zA-Z+/]=)?$/

const bigbase64 = randomBytes(1024 * 1024 * 300).toString("base64");
z.base64().parse(bigbase64);
const bigbase64url = randomBytes(1024 * 1024 * 300).toString("base64url");
z.base64url().parse(bigbase64url);
