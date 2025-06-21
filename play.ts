import * as z from "zod/v4";

console.dir(z, { depth: null });
console.dir(
  z
    .optional(z.array(z.string()))
    .check(z.overwrite((data) => data ?? []))
    .parse(undefined),
  { depth: null }
);
