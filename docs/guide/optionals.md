# Optionals

You can make any schema optional with `z.optional()`. This wraps the schema in a `ZodOptional` instance and returns the result.

```ts
const schema = z.optional(z.string());

schema.parse(undefined); // => returns undefined
type A = z.infer<typeof schema>; // string | undefined
```

For convenience, you can also call the `.optional()` method on an existing schema.

```ts
const user = z.object({
  username: z.string().optional(),
});
type C = z.infer<typeof user>; // { username?: string | undefined };
```

You can extract the wrapped schema from a `ZodOptional` instance with `.unwrap()`.

```ts
const stringSchema = z.string();
const optionalString = stringSchema.optional();
optionalString.unwrap() === stringSchema; // true
```
