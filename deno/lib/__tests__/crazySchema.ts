import * as z from "../index.ts";

export const crazySchema = z.object({
  tuple: z.tuple([
    z.string().nullable().optional(),
    z.number().nullable().optional(),
    z.boolean().nullable().optional(),
    z.null().nullable().optional(),
    z.undefined().nullable().optional(),
    z.literal("1234").nullable().optional(),
  ]),
  merged: z
    .object({
      k1: z.string().optional(),
    })
    .merge(z.object({ k1: z.string().nullable(), k2: z.number() })),
  union: z.array(z.union([z.literal("asdf"), z.literal(12)])).nonempty(),
  array: z.array(z.number()),
  // sumTransformer: z.transformer(z.array(z.number()), z.number(), (arg) => {
  //   return arg.reduce((a, b) => a + b, 0);
  // }),
  sumMinLength: z.array(z.number()).refine((arg) => arg.length > 5),
  intersection: z.intersection(
    z.object({ p1: z.string().optional() }),
    z.object({ p1: z.number().optional() })
  ),
  enum: z.intersection(z.enum(["zero", "one"]), z.enum(["one", "two"])),
  nonstrict: z.object({ points: z.number() }).nonstrict(),
  numProm: z.promise(z.number()),
  lenfun: z.function(z.tuple([z.string()]), z.boolean()),
});

export const asyncCrazySchema = crazySchema.extend({
  // async_transform: z.transformer(
  //   z.array(z.number()),
  //   z.number(),
  //   async (arg) => {
  //     return arg.reduce((a, b) => a + b, 0);
  //   }
  // ),
  async_refine: z.array(z.number()).refine(async (arg) => arg.length > 5),
});
