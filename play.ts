import * as z from "zod";

const Internal = z.object({
  num: z.number(),
  str: z.string(),
});
//.meta({ id: "Internal" });

const External = z.object({
  a: Internal,
  b: Internal.optional(),
  c: z.lazy(() => Internal),
  d: z.promise(Internal),
  e: z.pipe(Internal, Internal),
});
console.dir(
  z.toJSONSchema(External, {
    reused: "ref",
  }),
  { depth: null }
);
