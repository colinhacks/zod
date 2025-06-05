// import { expectTypeOf } from "vitest";
// import { expectTypeOf } from "vitest";
import { z } from "zod/v4";

export const slotSchema = z.object({
  slotCode: z.string(),

  get blocks() {
    return z.array(blockSchema);
  },
});

const a: A = null as any;

export const blockSchema = z.object({
  blockCode: z.string(),
  get slots() {
    // return z.array(slotSchema);              // would work, but we want `slots` to be optional
    return z.array(slotSchema).optional(); // infers `slots` as unknown below
    // return z.optional(z.array(slotSchema));  // causes a type error
  },
});

export const pageSchema = z.object({
  slots: z.array(slotSchema),
});

const test = pageSchema.parse(null);
test.slots;
// ^?
