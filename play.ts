import { z } from "zod/v3";

// console.dir(z, { depth: null });
// console.dir(
//   z
//     .optional(z.array(z.string()))
//     .check(z.overwrite((data) => data ?? []))
//     .parse(undefined),
//   { depth: null }
// );

z.object({
  schemas: z.transformer(
    z.nullable(
      z.array(
        z.object({
          name: z.string(),
        })
      )
    ),
    { type: "transform", transform: (data) => data ?? [] }
  ),
});
