import * as z from "zod/v4";

// import { z } from "zod/v4";

const itemSchema = z.object({
  id: z.number(),
  woody: z.string(),
  buzz: z.literal("lightyear"),
});

type ItemSchema = z.infer<typeof itemSchema>;

const getItem = <T extends keyof ItemSchema>(itemId = 1, fields: T[] = []): Pick<ItemSchema, T> => {
  const fetchItem = (itemId: number, fields: T[]) => {
    // imagine that the response would only contain what is specified in fields
    return {
      id: itemId,
      woody: "yeehaw",
      buzz: "lightyear",
    } as unknown;
  };

  const res = fetchItem(itemId, []);

  const pickedSchema = itemSchema.pick<{ [K in T]: true }>(
    fields.reduce((acc, field) => ({ ...acc, [field]: true }), {}) as { [K in T]: true }
  );

  return pickedSchema.parse(res) as any;
};
