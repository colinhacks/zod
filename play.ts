import * as z from "zod";

z;

// export const LinesSchema = <T extends z.ZodType<unknown, any>>(schema: T) =>
//   z
//     .string()
//     .transform((input) => input.trim().split("\n"))
//     .pipe(z.array(schema));

const AType = z.object({
  type: z.literal("a"),
  name: z.string(),
});

const BType = z.object({
  type: z.literal("b"),
  name: z.string(),
});

const CType = z.object({
  type: z.literal("c"),
  name: z.string(),
});

const Schema = z.object({
  type: z.literal("special").meta({ description: "Type" }),
  config: z.object({
    title: z.string().meta({ description: "Title" }),
    get elements() {
      return z.array(z.discriminatedUnion("type", [AType, BType, CType])).meta({
        id: "SpecialElements",
        title: "SpecialElements",
        description: "Array of elements",
      });
    },
  }),
});

console.log(
  Schema.parse({
    type: "special",
    config: {
      title: "Special",
      elements: [
        { type: "a", name: "John" },
        { type: "b", name: "Jane" },
        { type: "c", name: "Jim" },
      ],
    },
  })
);

// Demo: OpenAPI 3.1 support
const userSchema = z.object({
  name: z.string(),
  age: z.number().gt(0).lt(150),
  email: z.string().nullable(),
});

console.log("\n=== OpenAPI 3.1 Support ===");
console.log(JSON.stringify(z.toJSONSchema(userSchema, { target: "openapi-3.1" }), null, 2));

console.log("\n=== OpenAPI 3.0 (for comparison) ===");
console.log(JSON.stringify(z.toJSONSchema(userSchema, { target: "openapi-3.0" }), null, 2));
