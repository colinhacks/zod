import { toJSONSchema } from "@zod/core";
import { z } from "zod";

const data = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: {
        value: 4,
        next: null,
      },
    },
  },
};

const LinkedListSchema = z.interface({
  value: z.number(),
  get next() {
    return LinkedListSchema.or(z.null());
  },
});

console.log(LinkedListSchema._zod.def.shape);

LinkedListSchema.parse(data);
