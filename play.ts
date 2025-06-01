import { z } from "zod/v4";

// z;
import { discriminatedUnion, literal, object, pipe, string, transform } from "zod/v4-mini";

const schemaWithPipe = discriminatedUnion("type", [
  object({
    type: pipe(
      transform((v) => v),
      literal("a")
    ),
    a: string(),
  }),
  object({
    type: pipe(
      transform((v) => v),
      literal("b")
    ),
    b: string(),
  }),
]);

schemaWithPipe.safeParse({ type: "a", a: "abc" });
