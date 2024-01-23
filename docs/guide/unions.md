# Unions

Zod includes a built-in `z.union` method for composing "OR" types.

```ts
const stringOrNumber = z.union([z.string(), z.number()]);

stringOrNumber.parse("foo"); // passes
stringOrNumber.parse(14); // passes
```

Zod will test the input against each of the "options" in order and return the first value that validates successfully.

For convenience, you can also use the [`.or` method](#or):

```ts
const stringOrNumber = z.string().or(z.number());
```

**Optional string validation:**

To validate an optional form input, you can union the desired string validation with an empty string [literal](#literals).

This example validates an input that is optional but needs to contain a [valid URL](#strings):

```ts
const optionalUrl = z.union([z.string().url().nullish(), z.literal("")]);

console.log(optionalUrl.safeParse(undefined).success); // true
console.log(optionalUrl.safeParse(null).success); // true
console.log(optionalUrl.safeParse("").success); // true
console.log(optionalUrl.safeParse("https://zod.dev").success); // true
console.log(optionalUrl.safeParse("not a valid url").success); // false
```
