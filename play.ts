import { z } from "zod/v4";

const FirstSchema = z.object({
  testNum: z.number(),
});

const SecondSchema = z.object({
  testStr: z.string(),
});

const ThirdSchema = z.object({
  testBool: z.boolean(),
});

const HelloSchema = FirstSchema.and(SecondSchema).and(ThirdSchema).describe("123");

// Zod 4
const result = z.toJSONSchema(HelloSchema, { target: "draft-7" });
console.dir(result, { depth: null });
