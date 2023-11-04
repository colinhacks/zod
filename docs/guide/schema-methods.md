# Schema methods

All Zod schemas contain certain methods.

## `.parse`

`.parse(data: unknown): T`

Given any Zod schema, you can call its `.parse` method to check `data` is valid. If it is, a value is returned with full type information! Otherwise, an error is thrown.

> IMPORTANT: The value returned by `.parse` is a _deep clone_ of the variable you passed in.

```ts
const stringSchema = z.string();

stringSchema.parse("fish"); // => returns "fish"
stringSchema.parse(12); // throws error
```

## `.parseAsync`

`.parseAsync(data:unknown): Promise<T>`

If you use asynchronous [refinements](#refine) or [transforms](#transform) (more on those later), you'll need to use `.parseAsync`.

```ts
const stringSchema = z.string().refine(async (val) => val.length <= 8);

await stringSchema.parseAsync("hello"); // => returns "hello"
await stringSchema.parseAsync("hello world"); // => throws error
```

## `.safeParse`

`.safeParse(data:unknown): { success: true; data: T; } | { success: false; error: ZodError; }`

If you don't want Zod to throw errors when validation fails, use `.safeParse`. This method returns an object containing either the successfully parsed data or a ZodError instance containing detailed information about the validation problems.

```ts
stringSchema.safeParse(12);
// => { success: false; error: ZodError }

stringSchema.safeParse("billie");
// => { success: true; data: 'billie' }
```

The result is a _discriminated union_, so you can handle errors very conveniently:

```ts
const result = stringSchema.safeParse("billie");
if (!result.success) {
  // handle error then return
  result.error;
} else {
  // do something
  result.data;
}
```

## `.safeParseAsync`

> Alias: `.spa`

An asynchronous version of `safeParse`.

```ts
await stringSchema.safeParseAsync("billie");
```

For convenience, this has been aliased to `.spa`:

```ts
await stringSchema.spa("billie");
```

## `.refine`

`.refine(validator: (data:T)=>any, params?: RefineParams)`

Zod lets you provide custom validation logic via _refinements_. (For advanced features like creating multiple issues and customizing error codes, see [`.superRefine`](#superrefine).)

Zod was designed to mirror TypeScript as closely as possible. But there are many so-called "refinement types" you may wish to check for that can't be represented in TypeScript's type system. For instance: checking that a number is an integer or that a string is a valid email address.

For example, you can define a custom validation check on _any_ Zod schema with `.refine` :

```ts
const myString = z.string().refine((val) => val.length <= 255, {
  message: "String can't be more than 255 characters",
});
```

> ⚠️ Refinement functions should not throw. Instead they should return a falsy value to signal failure.

### Arguments

As you can see, `.refine` takes two arguments.

1. The first is the validation function. This function takes one input (of type `T` — the inferred type of the schema) and returns `any`. Any truthy value will pass validation. (Prior to zod@1.6.2 the validation function had to return a boolean.)
2. The second argument accepts some options. You can use this to customize certain error-handling behavior:

```ts
type RefineParams = {
  // override error message
  message?: string;

  // appended to error path
  path?: (string | number)[];

  // params object you can use to customize message
  // in error map
  params?: object;
};
```

For advanced cases, the second argument can also be a function that returns `RefineParams`.

```ts
const longString = z.string().refine(
  (val) => val.length > 10,
  (val) => ({ message: `${val} is not more than 10 characters` })
);
```

### Customize error path

```ts
const passwordForm = z
  .object({
    password: z.string(),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords don't match",
    path: ["confirm"], // path of error
  });

passwordForm.parse({ password: "asdf", confirm: "qwer" });
```

Because you provided a `path` parameter, the resulting error will be:

```ts
ZodError {
  issues: [{
    "code": "custom",
    "path": [ "confirm" ],
    "message": "Passwords don't match"
  }]
}
```

### Asynchronous refinements

Refinements can also be async:

```ts
const userId = z.string().refine(async (id) => {
  // verify that ID exists in database
  return true;
});
```

> ⚠️ If you use async refinements, you must use the `.parseAsync` method to parse data! Otherwise Zod will throw an error.

### Relationship to transforms

Transforms and refinements can be interleaved:

```ts
z.string()
  .transform((val) => val.length)
  .refine((val) => val > 25);
```

<!-- Note that the `path` is set to `["confirm"]` , so you can easily display this error underneath the "Confirm password" textbox.

```ts
const allForms = z.object({ passwordForm }).parse({
  passwordForm: {
    password: "asdf",
    confirm: "qwer",
  },
});
```

would result in

```

ZodError {
  issues: [{
    "code": "custom",
    "path": [ "passwordForm", "confirm" ],
    "message": "Passwords don't match"
  }]
}
``` -->

## `.superRefine`

The `.refine` method is actually syntactic sugar atop a more versatile (and verbose) method called `superRefine`. Here's an example:

```ts
const Strings = z.array(z.string()).superRefine((val, ctx) => {
  if (val.length > 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_big,
      maximum: 3,
      type: "array",
      inclusive: true,
      message: "Too many items 😡",
    });
  }

  if (val.length !== new Set(val).size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `No duplicates allowed.`,
    });
  }
});
```

You can add as many issues as you like. If `ctx.addIssue` is _not_ called during the execution of the function, validation passes.

Normally refinements always create issues with a `ZodIssueCode.custom` error code, but with `superRefine` it's possible to throw issues of any `ZodIssueCode`. Each issue code is described in detail in the Error Handling guide: [Error handling](/guide/error-handling).

### Abort early

By default, parsing will continue even after a refinement check fails. For instance, if you chain together multiple refinements, they will all be executed. However, it may be desirable to _abort early_ to prevent later refinements from being executed. To achieve this, pass the `fatal` flag to `ctx.addIssue` and return `z.NEVER`.

```ts
const schema = z.number().superRefine((val, ctx) => {
  if (val < 10) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "should be >= 10",
      fatal: true,
    });

    return z.NEVER;
  }

  if (val !== 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "should be twelve",
    });
  }
});
```

### Type refinements

If you provide a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) to `.refine()` or `.superRefine()`, the resulting type will be narrowed down to your predicate's type. This is useful if you are mixing multiple chained refinements and transformations:

```ts
const schema = z
  .object({
    first: z.string(),
    second: z.number(),
  })
  .nullable()
  .superRefine((arg, ctx): arg is { first: string; second: number } => {
    if (!arg) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom, // customize your issue
        message: "object should exist",
      });
    }

    return z.NEVER; // The return value is not used, but we need to return something to satisfy the typing
  })
  // here, TS knows that arg is not null
  .refine((arg) => arg.first === "bob", "`first` is not `bob`!");
```

> ⚠️ You **must** use `ctx.addIssue()` instead of returning a boolean value to indicate whether the validation passes. If `ctx.addIssue` is _not_ called during the execution of the function, validation passes.

## `.transform`

To transform data after parsing, use the `transform` method.

```ts
const stringToNumber = z.string().transform((val) => val.length);

stringToNumber.parse("string"); // => 6
```

### Chaining order

Note that `stringToNumber` above is an instance of the `ZodEffects` subclass. It is NOT an instance of `ZodString`. If you want to use the built-in methods of `ZodString` (e.g. `.email()`) you must apply those methods _before_ any transforms.

```ts
const emailToDomain = z
  .string()
  .email()
  .transform((val) => val.split("@")[1]);

emailToDomain.parse("colinhacks@example.com"); // => example.com
```

### Validating during transform

The `.transform` method can simultaneously validate and transform the value. This is often simpler and less duplicative than chaining `transform` and `refine`.

As with `.superRefine`, the transform function receives a `ctx` object with an `addIssue` method that can be used to register validation issues.

```ts
const numberInString = z.string().transform((val, ctx) => {
  const parsed = parseInt(val);
  if (isNaN(parsed)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Not a number",
    });

    // This is a special symbol you can use to
    // return early from the transform function.
    // It has type `never` so it does not affect the
    // inferred return type.
    return z.NEVER;
  }
  return parsed;
});
```

### Relationship to refinements

Transforms and refinements can be interleaved. These will be executed in the order they are declared.

```ts
const nameToGreeting = z
  .string()
  .transform((val) => val.toUpperCase())
  .refine((val) => val.length > 15)
  .transform((val) => `Hello ${val}`)
  .refine((val) => val.indexOf("!") === -1);
```

### Async transforms

Transforms can also be async.

```ts
const IdToUser = z
  .string()
  .uuid()
  .transform(async (id) => {
    return await getUserById(id);
  });
```

> ⚠️ If your schema contains asynchronous transforms, you must use .parseAsync() or .safeParseAsync() to parse data. Otherwise Zod will throw an error.

## `.default`

You can use transforms to implement the concept of "default values" in Zod.

```ts
const stringWithDefault = z.string().default("tuna");

stringWithDefault.parse(undefined); // => "tuna"
```

Optionally, you can pass a function into `.default` that will be re-executed whenever a default value needs to be generated:

```ts
const numberWithRandomDefault = z.number().default(Math.random);

numberWithRandomDefault.parse(undefined); // => 0.4413456736055323
numberWithRandomDefault.parse(undefined); // => 0.1871840107401901
numberWithRandomDefault.parse(undefined); // => 0.7223408162401552
```

Conceptually, this is how Zod processes default values:

1. If the input is `undefined`, the default value is returned
2. Otherwise, the data is parsed using the base schema

## `.describe`

Use `.describe()` to add a `description` property to the resulting schema.

```ts
const documentedString = z
  .string()
  .describe("A useful bit of text, if you know what to do with it.");
documentedString.description; // A useful bit of text…
```

This can be useful for documenting a field, for example in a JSON Schema using a library like [`zod-to-json-schema`](https://github.com/StefanTerdell/zod-to-json-schema)).

## `.catch`

Use `.catch()` to provide a "catch value" to be returned in the event of a parsing error.

```ts
const numberWithCatch = z.number().catch(42);

numberWithCatch.parse(5); // => 5
numberWithCatch.parse("tuna"); // => 42
```

Optionally, you can pass a function into `.catch` that will be re-executed whenever a default value needs to be generated. A `ctx` object containing the caught error will be passed into this function.

```ts
const numberWithRandomCatch = z.number().catch((ctx) => {
  ctx.error; // the caught ZodError
  return Math.random();
});

numberWithRandomCatch.parse("sup"); // => 0.4413456736055323
numberWithRandomCatch.parse("sup"); // => 0.1871840107401901
numberWithRandomCatch.parse("sup"); // => 0.7223408162401552
```

Conceptually, this is how Zod processes "catch values":

1. The data is parsed using the base schema
2. If the parsing fails, the "catch value" is returned

## `.optional`

A convenience method that returns an optional version of a schema.

```ts
const optionalString = z.string().optional(); // string | undefined

// equivalent to
z.optional(z.string());
```

## `.nullable`

A convenience method that returns a nullable version of a schema.

```ts
const nullableString = z.string().nullable(); // string | null

// equivalent to
z.nullable(z.string());
```

## `.nullish`

A convenience method that returns a "nullish" version of a schema. Nullish schemas will accept both `undefined` and `null`. Read more about the concept of "nullish" [in the TypeScript 3.7 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing).

```ts
const nullishString = z.string().nullish(); // string | null | undefined

// equivalent to
z.string().nullable().optional();
```

## `.array`

A convenience method that returns an array schema for the given type:

```ts
const stringArray = z.string().array(); // string[]

// equivalent to
z.array(z.string());
```

## `.promise`

A convenience method for promise types:

```ts
const stringPromise = z.string().promise(); // Promise<string>

// equivalent to
z.promise(z.string());
```

## `.or`

A convenience method for [union types](#unions).

```ts
const stringOrNumber = z.string().or(z.number()); // string | number

// equivalent to
z.union([z.string(), z.number()]);
```

## `.and`

A convenience method for creating intersection types.

```ts
const nameAndAge = z
  .object({ name: z.string() })
  .and(z.object({ age: z.number() })); // { name: string } & { age: number }

// equivalent to
z.intersection(z.object({ name: z.string() }), z.object({ age: z.number() }));
```

## `.brand`

`.brand<T>() => ZodBranded<this, B>`

TypeScript's type system is structural, which means that any two types that are structurally equivalent are considered the same.

```ts
type Cat = { name: string };
type Dog = { name: string };

const petCat = (cat: Cat) => {};
const fido: Dog = { name: "fido" };
petCat(fido); // works fine
```

In some cases, its can be desirable to simulate _nominal typing_ inside TypeScript. For instance, you may wish to write a function that only accepts an input that has been validated by Zod. This can be achieved with _branded types_ (AKA _opaque types_).

```ts
const Cat = z.object({ name: z.string() }).brand<"Cat">();
type Cat = z.infer<typeof Cat>;

const petCat = (cat: Cat) => {};

// this works
const simba = Cat.parse({ name: "simba" });
petCat(simba);

// this doesn't
petCat({ name: "fido" });
```

Under the hood, this works by attaching a "brand" to the inferred type using an intersection type. This way, plain/unbranded data structures are no longer assignable to the inferred type of the schema.

```ts
const Cat = z.object({ name: z.string() }).brand<"Cat">();
type Cat = z.infer<typeof Cat>;
// {name: string} & {[symbol]: "Cat"}
```

Note that branded types do not affect the runtime result of `.parse`. It is a static-only construct.

## `.readonly`

`.readonly() => ZodReadonly<this>`

This method returns a `ZodReadonly` schema instance that parses the input using the base schema, then calls `Object.freeze()` on the result. The inferred type is also marked as `readonly`.

```ts
const schema = z.object({ name: string }).readonly();
type schema = z.infer<typeof schema>;
// Readonly<{name: string}>

const result = schema.parse({ name: "fido" });
result.name = "simba"; // error
```

The inferred type uses TypeScript's built-in readonly types when relevant.

```ts
z.array(z.string()).readonly();
// readonly string[]

z.tuple([z.string(), z.number()]).readonly();
// readonly [string, number]

z.map(z.string(), z.date()).readonly();
// ReadonlyMap<string, Date>

z.set(z.string()).readonly();
// ReadonlySet<Promise<string>>
```

## `.pipe`

Schemas can be chained into validation "pipelines". It's useful for easily validating the result after a `.transform()`:

```ts
z.string()
  .transform((val) => val.length)
  .pipe(z.number().min(5));
```

The `.pipe()` method returns a `ZodPipeline` instance.

### You can use `.pipe()` to fix common issues with `z.coerce`.

You can constrain the input to types that work well with your chosen coercion. Then use `.pipe()` to apply the coercion.

without constrained input:

```ts
const toDate = z.coerce.date();

// works intuitively
console.log(toDate.safeParse("2023-01-01").success); // true

// might not be what you want
console.log(toDate.safeParse(null).success); // true
```

with constrained input:

```ts
const datelike = z.union([z.number(), z.string(), z.date()]);
const datelikeToDate = datelike.pipe(z.coerce.date());

// still works intuitively
console.log(datelikeToDate.safeParse("2023-01-01").success); // true

// more likely what you want
console.log(datelikeToDate.safeParse(null).success); // false
```

You can also use this technique to avoid coercions that throw uncaught errors.

without constrained input:

```ts
const toBigInt = z.coerce.bigint();

// works intuitively
console.log(toBigInt.safeParse("42")); // true

// probably not what you want
console.log(toBigInt.safeParse(null)); // throws uncaught error
```

with constrained input:

```ts
const toNumber = z.number().or(z.string()).pipe(z.coerce.number());
const toBigInt = z.bigint().or(toNumber).pipe(z.coerce.bigint());

// still works intuitively
console.log(toBigInt.safeParse("42").success); // true

// error handled by zod, more likely what you want
console.log(toBigInt.safeParse(null).success); // false
```
