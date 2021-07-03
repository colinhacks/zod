import { z } from "./index.ts";

const run = async () => {
  z;
  z.string().parse(1234);

  interface SyncHasMany<T> {
    // ...
    toArray(): T[];
  }

  function hasMany<T extends z.ZodTypeAny>(itemSchema: T) {
    return z
      .unknown()
      .transform(
        // z.array(itemSchema),
        // In case it is hasMany we should convert it to plain Array so Zod can digest it.
        (rel) =>
          Array.isArray(rel)
            ? (rel as z.TypeOf<T>[])
            : (rel as SyncHasMany<z.TypeOf<T>>).toArray()
      )
      .refine((arr) => {
        console.log(arr);
        return arr.every((el) => itemSchema.safeParse(el).success);
      });
  }

  const asdf = hasMany(z.string());
  console.log(asdf.safeParse(["asdf", "qwer"]));
};

run();

export {};
