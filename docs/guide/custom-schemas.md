# Custom schemas

You can create a Zod schema for any TypeScript type by using `z.custom()`. This is useful for creating schemas for types that are not supported by Zod out of the box, such as template string literals.

```ts
const px = z.custom<`${number}px`>((val) => {
  return typeof val === "string" ? /^\d+px$/.test(val) : false;
});

type px = z.infer<typeof px>; // `${number}px`

px.parse("42px"); // "42px"
px.parse("42vw"); // throws;
```

If you don't provide a validation function, Zod will allow any value. This can be dangerous!

```ts
z.custom<{ arg: string }>(); // performs no validation
```

You can customize the error message and other options by passing a second argument. This parameter works the same way as the params parameter of [`.refine`](#refine).

```ts
z.custom<...>((val) => ..., "custom error message");
```
