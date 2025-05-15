import * as z from "zod/v4";

z.set(z.number()).def.type;
const kitchenSchema = z.discriminatedUnion("utility", [
  z.object({ utility: z.literal("none") }),
  z.object({
    utility: z.literal("oven"),
    name: z.literal("Electric convection oven"),
    temperature: z.number().min(50).max(300),
    position: z.enum(["bottom", "middle", "top"]),
  }),
  z.object({
    utility: z.literal("cooker"),
    name: z.literal("Cooker hob"),
    heat: z.number().min(1).max(9),
    position: z.enum(["left", "right", "top"]),
  }),
  z.object({
    utility: z.literal("microwave"),
    name: z.literal("Microwave oven"),
    watts: z.enum(["600", "800", "1000"]),
  }),
]);

// this no longer works, even when using the “values” Set
const discriminators = kitchenSchema.def.options.map((el) => el.shape.utility);
const utilitiesSchema = z.union(discriminators);
console.log(utilitiesSchema);
// const utilitiesSchema = z.enum(kitchenSchema.options.map(({ shape }) => shape.id.value));

const myReg = z.registry<z.GlobalMeta>();

z.string().register(myReg, { title: "My String" });
