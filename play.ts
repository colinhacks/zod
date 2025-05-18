import * as z from "zod/v4";

// import { z } from "zod/v4";

const schema = z.object({
  topLevel: z.discriminatedUnion("topLevelDiscKey", [
    z.object({
      topLevelDiscKey: z.literal("fruit"),
      lowLevel: z.discriminatedUnion("lowLevelDiscKey", [
        z.object({
          lowLevelDiscKey: z.literal("apple"),
          someKey: z.literal("1$"),
        }),
        z.object({
          lowLevelDiscKey: z.literal("banana"),
          someKey: z.number(),
        }),
      ]),
    }),
  ]),
});

// Works.
const firstDiscUnion = schema.parse({
  topLevel: { topLevelDiscKey: "fruit", lowLevel: { lowLevelDiscKey: "apple", someKey: "1$" } },
} satisfies z.infer<typeof schema>);
console.info(firstDiscUnion);

// Does not work.
// Throws 'No matching discriminator' error.
// However, this code works in zod v3 (for v3 schema needed to be slightly modified to explicitly specify the discriminator).
const secondDiscUnion = schema.parse({
  topLevel: { topLevelDiscKey: "fruit", lowLevel: { lowLevelDiscKey: "banana", someKey: 2 } },
} satisfies z.infer<typeof schema>);
console.info(secondDiscUnion);
