# Guides and concepts

## Type inference

You can extract the TypeScript type of any schema with `z.infer<typeof mySchema>` .

```ts
const A = z.string();
type A = z.infer<typeof A>; // string

const u: A = 12; // TypeError
const u: A = "asdf"; // compiles
```

**What about transforms?**

In reality each Zod schema internally tracks **two** types: an input and an output. For most schemas (e.g. `z.string()`) these two are the same. But once you add transforms into the mix, these two values can diverge. For instance `z.string().transform(val => val.length)` has an input of `string` and an output of `number`.

You can separately extract the input and output types like so:

```ts
const stringToNumber = z.string().transform((val) => val.length);

// ⚠️ Important: z.infer returns the OUTPUT type!
type input = z.input<typeof stringToNumber>; // string
type output = z.output<typeof stringToNumber>; // number

// equivalent to z.output!
type inferred = z.infer<typeof stringToNumber>; // number
```

## Writing generic functions

When attempting to write a function that accepts a Zod schema as an input, it's common to try something like this:

```ts
function makeSchemaOptional<T>(schema: z.ZodType<T>) {
  return schema.optional();
}
```

This approach has some issues. The `schema` variable in this function is typed as an instance of `ZodType`, which is an abstract class that all Zod schemas inherit from. This approach loses type information, namely _which subclass_ the input actually is.

```ts
const arg = makeSchemaOptional(z.string());
arg.unwrap();
```

A better approach is for the generic parameter to refer to _the schema as a whole_.

```ts
function makeSchemaOptional<T extends z.ZodTypeAny>(schema: T) {
  return schema.optional();
}
```

> `ZodTypeAny` is just a shorthand for `ZodType<any, any, any>`, a type that is broad enough to match any Zod schema.

As you can see, `schema` is now fully and properly typed.

```ts
const arg = makeSchemaOptional(z.string());
arg.unwrap(); // ZodString
```

### Constraining allowable inputs

The `ZodType` class has three generic parameters.

```ts
class ZodType<
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
> { ... }
```

By constraining these in your generic input, you can limit what schemas are allowable as inputs to your function:

```ts
function makeSchemaOptional<T extends z.ZodType<string>>(schema: T) {
  return schema.optional();
}

makeSchemaOptional(z.string());
// works fine

makeSchemaOptional(z.number());
// Error: 'ZodNumber' is not assignable to parameter of type 'ZodType<string, ZodTypeDef, string>'
```

## Error handling

Zod provides a subclass of Error called `ZodError`. ZodErrors contain an `issues` array containing detailed information about the validation problems.

```ts
const result = z
  .object({
    name: z.string(),
  })
  .safeParse({ name: 12 });

if (!result.success) {
  result.error.issues;
  /* [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": [ "name" ],
        "message": "Expected string, received number"
      }
  ] */
}
```

> For detailed information about the possible error codes and how to customize error messages, check out the dedicated error handling guide: [ERROR_HANDLING.md](ERROR_HANDLING.md)

Zod's error reporting emphasizes _completeness_ and _correctness_. If you are looking to present a useful error message to the end user, you should either override Zod's error messages using an error map (described in detail in the Error Handling guide) or use a third-party library like [`zod-validation-error`](https://github.com/causaly/zod-validation-error)

## Error formatting

You can use the `.format()` method to convert this error into a nested object.

```ts
const result = z
  .object({
    name: z.string(),
  })
  .safeParse({ name: 12 });

if (!result.success) {
  const formatted = result.error.format();
  /* {
    name: { _errors: [ 'Expected string, received number' ] }
  } */

  formatted.name?._errors;
  // => ["Expected string, received number"]
}
```
