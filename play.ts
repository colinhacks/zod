import * as z from "zod/v4";

const baseSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.string().array(),
});

const refinedSchema = baseSchema.superRefine((val, ctx) => {
  if (val.items.length === 0) {
    ctx.addIssue({
      message: "Must have at least one item",
      code: "custom",
      path: ["items"],
    });
  }
});

console.log("refinedSchema._zod.def.checks:", refinedSchema._zod.def.checks);

try {
  const picked = refinedSchema.pick({ name: true });
  console.log("pick succeeded!", picked);
} catch (e) {
  console.log("pick threw error:", e);
}
