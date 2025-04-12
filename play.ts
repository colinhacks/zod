import * as z from "zod";

const a = z.object({
  type: z.object({ key: z.literal("A") }),
  name: z.string(),
});

const b = z.object({
  type: z.object({ key: z.literal("B") }),
  age: z.number(),
});

const c = z.discriminatedUnion([a, b]);

console.log(
  c.safeParse({
    type: { key: "A" },
    name: "hello",
  })
);

console.log(
  c.safeParse({
    type: { key: "B" },
    age: 12,
  })
);

// z.int();
