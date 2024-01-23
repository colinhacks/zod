# Recursive types

You can define a recursive schema in Zod, but because of a limitation of TypeScript, their type can't be statically inferred. Instead you'll need to define the type definition manually, and provide it to Zod as a "type hint".

```ts
const baseCategorySchema = z.object({
  name: z.string(),
});

type Category = z.infer<typeof baseCategorySchema> & {
  subcategories: Category[];
};

const categorySchema: z.ZodType<Category> = baseCategorySchema.extend({
  subcategories: z.lazy(() => categorySchema.array()),
});

categorySchema.parse({
  name: "People",
  subcategories: [
    {
      name: "Politicians",
      subcategories: [
        {
          name: "Presidents",
          subcategories: [],
        },
      ],
    },
  ],
}); // passes
```

Thanks to [crasite](https://github.com/crasite) for this example.

## ZodType with ZodEffects

When using `z.ZodType` with `z.ZodEffects` (
[`.refine`](https://github.com/colinhacks/zod#refine),
[`.transform`](https://github.com/colinhacks/zod#transform),
[`preprocess`](https://github.com/colinhacks/zod#preprocess),
etc...
), you will need to define the input and output types of the schema. `z.ZodType<Output, z.ZodTypeDef, Input>`

```ts
const isValidId = (id: string): id is `${string}/${string}` =>
  id.split("/").length === 2;

const baseSchema = z.object({
  id: z.string().refine(isValidId),
});

type Input = z.input<typeof baseSchema> & {
  children: Input[];
};

type Output = z.output<typeof baseSchema> & {
  children: Output[];
};

const schema: z.ZodType<Output, z.ZodTypeDef, Input> = baseSchema.extend({
  children: z.lazy(() => schema.array()),
});
```

Thanks to [marcus13371337](https://github.com/marcus13371337) and [JoelBeeldi](https://github.com/JoelBeeldi) for this example.

## JSON type

If you want to validate any JSON value, you can use the snippet below.

```ts
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
);

jsonSchema.parse(data);
```

Thanks to [ggoodman](https://github.com/ggoodman) for suggesting this.

## Cyclical objects

Despite supporting recursive schemas, passing cyclical data into Zod will cause an infinite loop.
