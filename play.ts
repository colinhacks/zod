import * as z from "zod/v4";

const schema = z.object({
  a: z.literal("discKey"),
  b: z.enum(["apple", "banana"]),
  c: z.object({ id: z.string() }),
});

const input = {
  a: "discKey",
  b: "apple",
  c: {}, // Invalid, as schema requires `id` property
};

// Validation must fail here, but it doesn't
const testDiscUnion = z.discriminatedUnion([schema]).parse(input);
console.dir(testDiscUnion, { depth: null });
