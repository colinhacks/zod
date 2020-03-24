# Zod

<img src="logo.svg" alt="logo" width="200"/>

### Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Primitives](#primitives)
  - [Literals](#literals)
  - [Parsing](#parsing)
  - [Type inference](#type-inference)
  - [Objects](#objects)
  - [Arrays](#arrays)
  - [Unions](#unions)
    - [Optional types](#optional-types)
    - [Nullable types](#nullable-types)
  - [Enums](#enums)
  - [Tuples](#tuples)
  - [Intersections](#intersections)
  - [Recursive types](#recursive-types)
  - [Function schemas](#function-schemas)
- [Comparison](#comparison)

  - [Joi](#joi)
  - [Yup](#yup)
  - [io-ts](#io-ts)
  - [Runtypes](#runtypes)

# Installation

To install the latest version:

```sh
npm install --save zod
```

```sh
yarn add zod
```

### TypeScript versions

Zod 1.0.x is compatible with TypeScript 3.0+.

# Usage

Zod is a validation library designed for optimal developer experience. It's a TypeScript-first schema declaration library with rigorous (and correct!) inferred types, incredible developer experience, and a few killer features missing from the existing libraries.

- It takes advantage of TypeScript generic inference to statically infer the types of your schemas, eliminating the need to define static types and runtime validators separately.
- Eliminates the need to keep static types and runtime validators in sync by hand
- It has a composable, declarative API that makes it easy to define complex types concisely.
- Schemas are immutable. All methods return a new schema instance.

Zod was also designed with some core principles designed to make all declarations as non-magical and developer-friendly as possible:

- All fields are required unless explicitly marked as optional (just like TypeScript!)
- Schemas are immutable; methods (i.e. `.optional()` return a new instance.
- Zod schemas operate on a ["Parse, don't validate!"](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) basis!

## Primitives

```ts
import * as z from 'zod';

const stringSchema = z.string(); // => ZodType<string>
const numberSchema = z.number(); // => ZodType<number>
const booleanSchema = z.boolean(); // => ZodType<boolean>
const undefinedSchema = z.undefined(); // => ZodType<undefined>
const nullTypeSchema = z.null(); // => ZodType<null>
```

## Literals

```ts
const tuna = z.literal('tuna'); // => ZodType<'tuna'>
const twelve = z.literal(12); // => ZodType<12>
const tru = z.boolean(true); // => ZodType<true>
```

## Parsing and validation

Given a Zod schema, you can call its `.parse(data)` method to check `data` is valid. If it is, `data` is returned (with full type information!). Otherwise, an error is thrown.

```ts
const stringSchema = z.string();
stringSchema.parse('fish'); // => "fish"
stringSchema.parse(12); // throws Error('Non-string type: number');
```

You can also use a Zod schema as a type guard using the schema's `.check()` method, like so:

```ts
const stringSchema = z.string();
const blob: any = 'Albuquerque';
if (stringSchema.check(blob)) {
  // blob is now of type `string`
  // within this if statement
}
```

The same method can be used to check a _lack_ of

```ts
const stringSchema = z.string();

const process = (blob: any) => {
  if (!stringSchema.check(blob)) {
    throw new Error('Not a string');
  }

  // blob is now of type `string`
  // underneath the if statement
};
```

## Type inference

You can extract the TypeScript type of any schema with `z.TypeOf<>`.

```ts
const A = z.string();
type A = z.TypeOf<typeof A>; // string

const u: A = 12; // TypeError
const u: A = 'asdf'; // compiles
```

We'll include examples of inferred types throughout the rest of the documentation.

## Objects

```ts
// all properties are required by default
const dogSchema = z.object({
  name: z.string(),
  age: z.number(),
  neutered: z.boolean(),
});

type Dog = z.TypeOf<typeof dogSchema>;
/* 
equivalent to:
type Dog = { 
  name:string; 
  age: number; 
  neutered: boolean;
}
*/

const cujo = dogSchema.parse({
  name: 'Cujo',
  age: 4,
  neutered: true,
}); // passes, returns Dog

const fido: Dog = {
  name: 'Fido',
  age: 2,
}; // TypeError: missing required property `neutered`
```

## Arrays

```ts
const dogsList = z.array(dogSchema);

dogsList.parse([{ name: 'Fido', age: 4, neutered: true }]); // passes

dogsList.parse([]); // passes

// Non-empty lists

const nonEmptyDogsList = z.array(dogSchema).nonempty();
nonEmptyDogsList.parse([]); // throws Error("Array cannot be empty")
```

## Unions

Zod includes a built-in `z.union` method for composing "OR" types.

```ts
const stringOrNumber = z.union([z.string(), z.number()]);

stringOrNumber.parse('foo'); // passes
stringOrNumber.parse(14); // passes
```

### Optional types

Unions are the basis for defining optional schemas. An "optional string" is just the union of `string` and `undefined`.

```ts
const A = z.union([z.string(), z.undefined()]);

A.parse(undefined); // => passes, returns undefined
type A = z.TypeOf<typeof A>; // string | undefined
```

Zod provides a shorthand way to make any schema optional:

```ts
const B = z.string().optional(); // equivalent to A

const C = z.object({
  username: z.string().optional(),
});
type C = z.TypeOf<typeof C>; // { username?: string | undefined };
```

### Nullable types

Similarly, you can create nullable types like so:

```ts
const D = z.union([z.string(), z.null()]);
```

Or you can use the shorthand `.nullable()`:

```ts
const E = z.string().nullable(); // equivalent to D
type E = z.TypeOf<typeof D>; // string | null
```

You can create unions of any two or more schemas.

```ts
/* Custom Union Types */

const F = z
  .union([z.string(), z.number(), z.boolean()])
  .optional()
  .nullable();

F.parse('tuna'); // => tuna
F.parse(42); // => 42
F.parse(true); // => true
F.parse(undefined); // => undefined
F.parse(null); // => null
F.parse({}); // => throws Error!

type F = z.TypeOf<typeof F>; // string | number | boolean | undefined | null;
```

## Enums

You can combine unions and string literals to create an enum schemas.

```ts
const FishEnum = t.union([t.literal('Salmon'), t.literal('Tuna'), t.literal('Trout')]);

FishEnum.parse('Salmon'); // => "Salmon"
FishEnum.parse('Flounder'); // => throws
```

You can also use the built-in `z.enum()` function, like so:

```ts
const FishEnum = t.enum([t.literal('Salmon'), t.literal('Tuna'), t.literal('Trout')]);

// you can autocomplete values
// with the `.Values` variable
FishEnum.Values.Salmon; // => autocompletes
FishEnum.Values;
/* 
{
  Salmon: "Salmon",
  Tuna: "Tuna",
  Trout: "Trout",
} 
*/
```

## Intersections

Intersections are useful for creating "logical AND" types.

```ts
const a = z.union([z.number(), z.string()]);
const b = z.union([z.number(), z.boolean()]);

const c = z.intersection(a, b);
type c = z.TypeOf<typeof C>; // => number

const stringAndNumber = z.intersection(z.string(), z.number());
type Never = z.TypeOf<typeof stringAndNumber>; // => never
```

This is particularly useful for defining "schema mixins" that you can apply to multiple schemas.

```ts
const HasId = z.object({
  id: z.string(),
});

const BaseTeacher = z.object({
  name: z.string(),
});

const Teacher = z.intersection(BaseTeacher, HasId);

type Teacher = z.TypeOf<typeof Teacher>;
// { id:string; name:string };
```

### Object merging

In the examples above, the return value of `z.intersection` is an instance of `ZodIntersection`, a generic class that wraps the two schemas passed in as arguments.

But if you're trying to combine two object schemas, there is a shorthand:

```ts
const Teacher = BaseTeacher.merge(HasId);
```

The benefit of using this shorthand is that the returned value is a new object schema (`ZodObject`), instead of a generic `ZodIntersection` instance. This way, you're able to fluently chain together many `.merge` calls:

```ts
// chaining mixins
const Teacher = BaseTeacher.merge(HasId)
  .merge(HasName)
  .merge(HasAddress);
```

## Tuples

These differ from arrays in that they have a fixed number of elements, and each element can have a different type.

```ts
const athleteSchema = z.tuple([
  // takes an array of schemas
  z.string(), // name
  z.number(), // jersey number
  z.object({
    pointsScored: z.number(),
  }), // statistics
]);

type Athlete = z.TypeOf<typeof athleteSchema>;
// type Athlete = [string, number, { pointsScored: number }]
```

## Recursive types

You can define a recursive schema in Zod, but because of a limitation of TypeScript, their type can't be statically inferred. If you need a recursive Zod schema you'll need to define the type definition manually, and provide it to Zod as a "type hint".

```ts
interface Category {
  name: string;
  subcategories: Category[];
}

const Category: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    subcategories: z.array(Category),
  }),
);

Category.parse({
  name: 'People',
  subcategories: [
    {
      name: 'Politicians',
      subcategories: [{ name: 'Presidents', subcategories: [] }],
    },
  ],
}); // passes
```

## Function schemas

Zod also lets you define "function schemas". This makes it easy to validate the inputs and outputs of a function without intermixing your validation code and "business logic".

You can create a function schema with `z.function(args, returnType)` which accepts these arguments.

- `args: ZodTuple` The first argument is a tuple (created with `z.tuple([...])` and defines the schema of the arguments to your function. If the function doesn't accept arguments, you can pass an empty tuple (`z.tuple([])`).
- `returnType: ZodType` The second argument is the function's return type. This can be any Zod schema.

```ts
const args = z.tuple([
  z.object({ nameStartsWith: z.string() }), // filters
  z.object({ skip: z.number(), limit: z.number() }), // pagination
]);

const returnType = z.array(
  z.object({
    id: string(),
    name: string(),
  }),
);

const FetcherFactory = z.function(args, returnType);
```

`z.function` returns a higher-order "function factory". Every "factory" has `.validate()` method which accepts a function as input and returns a new function. The returned function automatically validates both its inputs and return value against the schemas provided to `z.function`. If either is invalid, the function throws.

This way you can confidently execute business logic in a "validated function" without worrying about invalid inputs or return types, mixing your validation and business logic, or writing duplicative types for your functions.

Here's an example.

```ts
const validatedQueryUser = FetchFunction.validate((filters, pagination) => {
  // the arguments automatically have the appropriate types
  // as defined by the args tuple passed to `z.function()`
  // without needing to provide types in the function declaration

  filters.nameStartsWith; // autocompletes
  filters.ageLessThan; // TypeError

  // TypeScript statically verifies that value returned by
  // this function is of type { id: string; name: string; }[]

  return 'salmon'; // TypeError
});

const users = validatedQueryUser(
  {
    nameStartsWith: 'John',
  },
  {
    skip: 0,
    limit: 20,
  },
);

// `typeof users` => { id: string; name: string; }[]
```

This is particularly useful for defining HTTP or RPC endpoints that accept complex payloads that require validation. Moreover, you can define your endpoints once with Zod and share the code with both your client and server code to achieve end-to-end type safety.

# Comparison

There are a handful of other widely-used validation libraries, but all of them have certain design limitations that make for a non-ideal developer experience.

### Joi

[https://github.com/hapijs/joi](https://github.com/hapijs/joi)

Doesn't support static type inference. 😕

### Yup

[https://github.com/jquense/yup](https://github.com/jquense/yup)

Yup is a full-featured library that was implemented first in vanilla JS, with TypeScript typings added later.

Yup supports static type inference, but unfortunately the inferred types aren't actually correct. Currently, the yup package treats all object properties as optional by default:

```ts
const schema = yup.object({
  asdf: yup.string(),
});
schema.validate({}); // passes

type SchemaType = yup.InferType<typeof schema>;
// returns { asdf: string }
// should be { asdf?: string }
```

Yup also mis-infers the type of required arrays.

```ts
const numList = yup
  .array()
  .of(yup.string())
  .required();

// interpreted as a non-empty list
numList.validateSync([]); // fails

// yet the inferred type doesn't reflect this
type NumList = yup.InferType<typeof numList>;
// returns 		string[]
// should be 	[string,...string[]]
```

These may sound like nitpicks. But it's not acceptable that an object that's assignable to the inferred TypeScript type can fail validation by the validator it was inferred from.

### io-ts

[https://github.com/gcanti/io-ts](https://github.com/gcanti/io-ts)

io-ts is an excellent library by gcanti. The API of io-ts heavily inspired the design of Zod.

In our experience, io-ts prioritizes functional programming purity over developer experience in many cases. This is a valid and admirable design goal, but it makes io-ts particularly hard to integrate into an existing codebase with a more procedural or object-oriented bias.

For instance, consider how to define an object with optional properties in io-ts:

```ts
const A = t.type({
  foo: t.string,
});

const B = t.partial({
  bar: t.number,
});

const C = t.intersection([A, B]);

type C = t.TypeOf<typeof C>;
// returns { foo: string; bar?: number | undefined }
```

You must define the required and optional props in separate object validators, pass the optionals through `t.partial` (which marks all properties as optional), then combine them with `t.intersection`.

Consider the equivalent in Zod:

```ts
const C = z.object({
  foo: z.string(),
  bar: z.string().optional(),
});

type C = z.TypeOf<typeof C>;
// returns { foo: string; bar?: number | undefined }
```

This more declarative API makes schema definitions vastly more concise.

`io-ts` also requires the use of gcanti's functional programming library `fp-ts` to parse results and handle errors. This is another fantastic resource for developers looking to keep their codebase strictly functional. But depending on `fp-ts` necessarily comes with a lot of intellectual overhead; a developer has to be familiar with functional programming concepts, `fp-ts`'s nomenclature, and the `Either` monad to do a simple schema validation. It's just not worth it for many people.

### Runtypes

[https://github.com/pelotom/runtypes](https://github.com/pelotom/runtypes)
