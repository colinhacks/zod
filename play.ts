import * as z from "zod/v4";

export const a = z.object({
  asdf: z.iso.datetime(),
});

const fn = z.function({
  // input: z.tuple([z.string()], z.number()),
  output: z.string(),
});

fn.def.output;
fn.def.input;
