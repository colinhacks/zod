import * as z from "zod";

const SomeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("foo"), foo: z.string() }),
  z.object({ type: z.literal("bar"), bar: z.string() }),
  z.object({ type: z.literal("baz"), baz: z.string() }),
]);

SomeSchema.parse({ type: "qux" });
