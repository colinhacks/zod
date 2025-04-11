import * as z from "zod";

const ConfigBase = z.object({
  name: z.string(),
});

const FreeConfig = z.object({
  type: z.literal("free"),
  min_cents: z.null(),
});

// console.log(FreeConfig.shape.type);
const PricedConfig = z.object({
  type: z.literal("fiat-price"),
  // min_cents: z.int().nullable(),
  min_cents: z.null(),
});

const Config = z.discriminatedUnion([FreeConfig, PricedConfig]);

Config.parse({
  min_cents: null,
  type: "fiat-price",
  name: "Standard",
});
